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
 * Пересчитывает матчи по сохранённому photoHash и применяет текущий entitlement.
 * Используется после возврата пользователя со страницы оплаты: фронт перезапрашивает
 * /api/search/{id} и получает уже разблокированные результаты.
 */
export async function GET(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await ctx.params;
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Сессия не инициализирована." }, { status: 401 });
  }

  const search = await getSearchForSession(id, sessionId);
  if (!search) {
    return NextResponse.json({ error: "Поиск не найден." }, { status: 404 });
  }

  let sources: MatchSource[];
  try {
    sources = sourcesSchema.parse(search.sources);
  } catch {
    return NextResponse.json({ error: "Повреждённые данные поиска." }, { status: 500 });
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
      { error: "Сервис распознавания временно недоступен. Попробуйте позже." },
      { status: 502 },
    );
  }
}
