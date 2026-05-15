import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getFaceMatchProvider, toPublicMatches } from "@/lib/face-match";
import type { MatchSource } from "@/lib/face-match";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/request";
import { readSessionId } from "@/lib/session";
import { createSearch, ensureAnonymousSession } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;
const ACCEPT_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const sourceSchema = z.enum(["public", "models", "sports", "archive"]);
const sourcesSchema = z.array(sourceSchema).min(1, "Select at least one source").max(4);

export async function POST(request: Request): Promise<NextResponse> {
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Session not initialised." }, { status: 401 });
  }

  // The key from the signed session (HMAC) cannot be forged, unlike X-Forwarded-For.
  const limitKey = getRateLimitKey("match", { sessionId, request });
  const limit = checkRateLimit(limitKey, env.RATE_LIMIT_PER_MINUTE);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((limit.resetAt - Date.now()) / 1000).toString(),
        },
      },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("multipart/form-data")) {
    return NextResponse.json({ error: "Expected multipart/form-data." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Failed to read the form." }, { status: 400 });
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "The photo field is required." }, { status: 400 });
  }
  if (!ACCEPT_MIME.has(photo.type)) {
    return NextResponse.json({ error: "Only JPG, PNG and WEBP are supported." }, { status: 415 });
  }
  if (photo.size === 0) {
    return NextResponse.json({ error: "File is empty." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "File too large. Max 15 MB." }, { status: 413 });
  }

  const rawSources = formData.get("sources");
  let parsedSources: MatchSource[];
  try {
    const value = typeof rawSources === "string" ? JSON.parse(rawSources) : rawSources;
    parsedSources = sourcesSchema.parse(value);
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Invalid sources list.";
    return NextResponse.json({ error: message ?? "Invalid sources list." }, { status: 400 });
  }

  const buffer = Buffer.from(await photo.arrayBuffer());
  const photoHash = createHash("sha256").update(buffer).digest("hex");

  try {
    await ensureAnonymousSession(sessionId);
    const search = await createSearch({
      sessionId,
      photoHash,
      sources: parsedSources,
    });

    const provider = getFaceMatchProvider();
    const response = await provider.match({
      photoHash,
      photo: buffer,
      mimeType: photo.type,
      sources: parsedSources,
    });

    // A freshly created search is never unlocked, but we return the field explicitly
    // for compatibility with /api/search/[id], which uses the same shape.
    const unlocked = false;
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
        headers: {
          "Cache-Control": "no-store",
          "X-RateLimit-Remaining": String(limit.remaining),
        },
      },
    );
  } catch (err) {
    console.error("Face match failed", err);
    return NextResponse.json(
      { error: "The matching service is temporarily unavailable. Try again later." },
      { status: 502 },
    );
  }
}
