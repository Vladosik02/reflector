import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getFaceMatchProvider } from "@/lib/face-match";
import type { MatchSource } from "@/lib/face-match";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 15 * 1024 * 1024;
const ACCEPT_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

const sourceSchema = z.enum(["public", "models", "sports", "archive"]);
const sourcesSchema = z.array(sourceSchema).min(1, "Выберите хотя бы один источник").max(4);

export async function POST(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const limit = checkRateLimit(`match:${ip}`, env.RATE_LIMIT_PER_MINUTE);
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

  try {
    const provider = getFaceMatchProvider();
    const response = await provider.match({
      photo: buffer,
      mimeType: photo.type,
      sources: parsedSources,
    });
    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-RateLimit-Remaining": String(limit.remaining),
      },
    });
  } catch (err) {
    console.error("Face match failed", err);
    return NextResponse.json(
      { error: "Сервис распознавания временно недоступен. Попробуйте позже." },
      { status: 502 },
    );
  }
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
