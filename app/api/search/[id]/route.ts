import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getFaceMatchProvider, toPublicMatches } from "@/lib/face-match";
import type { MatchSource } from "@/lib/face-match";
import { readSessionId } from "@/lib/session";
import { getSearchForSession, isSearchUnlocked } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const sourcesSchema = z.array(z.enum(["public", "models", "sports", "archive"]));

/**
 * Recomputes matches from the stored photoHash and applies the current entitlement.
 * Used after the user returns from the payment page: the frontend re-requests
 * /api/search/{id} and gets back the already-unlocked results.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Session not initialised." }, { status: 401 });
  }

  const search = await getSearchForSession(id, sessionId);
  if (!search) {
    return NextResponse.json({ error: "Search not found." }, { status: 404 });
  }

  let sources: MatchSource[];
  try {
    sources = sourcesSchema.parse(search.sources);
  } catch {
    return NextResponse.json({ error: "Corrupted search data." }, { status: 500 });
  }

  try {
    const provider = getFaceMatchProvider();
    const response = await provider.match({
      photoHash: search.photoHash,
      mimeType: "image/octet-stream",
      sources,
    });

    const unlocked = await isSearchUnlocked(search.id);
    const publicMatches = toPublicMatches(response.matches, unlocked);

    return NextResponse.json(
      {
        searchId: search.id,
        unlocked,
        matches: publicMatches,
        retentionSeconds: response.retentionSeconds,
        unlockPrice: {
          amountMinor: env.UNLOCK_PRICE_MINOR,
          currency: env.UNLOCK_CURRENCY,
        },
      },
      {
        status: 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch (err) {
    console.error("Face match failed (search/[id])", err);
    return NextResponse.json(
      { error: "The matching service is temporarily unavailable. Try again later." },
      { status: 502 },
    );
  }
}
