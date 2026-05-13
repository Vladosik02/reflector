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
const sourcesSchema = z.array(sourceSchema).min(1, "Выберите хотя бы один источник").max(4);

export async function POST(request: Request): Promise<NextResponse> {
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Сессия не инициализирована." }, { status: 401 });
  }

  // Ключ от подписанной session (HMAC) не подделать, в отличие от X-Forwarded-For.
  const limitKey = getRateLimitKey("match", { sessionId, request });
  const limit = checkRateLimit(limitKey, env.RATE_LIMIT_PER_MINUTE);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте через минуту." },
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
    return NextResponse.json({ error: "Ожидается multipart/form-data." }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Не удалось прочитать форму." }, { status: 400 });
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File)) {
    return NextResponse.json({ error: "Поле photo обязательно." }, { status: 400 });
  }
  if (!ACCEPT_MIME.has(photo.type)) {
    return NextResponse.json({ error: "Поддерживаются только JPG, PNG и WEBP." }, { status: 415 });
  }
  if (photo.size === 0) {
    return NextResponse.json({ error: "Файл пустой." }, { status: 400 });
  }
  if (photo.size > MAX_BYTES) {
    return NextResponse.json({ error: "Файл слишком большой. Максимум 15 МБ." }, { status: 413 });
  }

  const rawSources = formData.get("sources");
  let parsedSources: MatchSource[];
  try {
    const value = typeof rawSources === "string" ? JSON.parse(rawSources) : rawSources;
    parsedSources = sourcesSchema.parse(value);
  } catch (err) {
    const message =
      err instanceof z.ZodError ? err.issues[0]?.message : "Некорректный список источников.";
    return NextResponse.json(
      { error: message ?? "Некорректный список источников." },
      { status: 400 },
    );
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

    // Только что созданный поиск никогда не разблокирован — но возвращаем поле явно
    // для совместимости с /api/search/[id], который пользуется им же.
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
      { error: "Сервис распознавания временно недоступен. Попробуйте позже." },
      { status: 502 },
    );
  }
}

