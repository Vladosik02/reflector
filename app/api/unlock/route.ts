import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/request";
import { readSessionId } from "@/lib/session";
import { getSearchForSession, isSearchUnlocked, startUnlockCheckout } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  searchId: z.string().uuid("searchId must be a UUID"),
});

export async function POST(request: Request): Promise<NextResponse> {
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Сессия не инициализирована." }, { status: 401 });
  }

  // Узкий лимит на инициацию оплаты: каждый legitimate платёж — это один POST.
  const limit = checkRateLimit(getRateLimitKey("unlock", { sessionId, request }), 5);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Подождите минуту." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil((limit.resetAt - Date.now()) / 1000).toString() },
      },
    );
  }

  let body: z.infer<typeof bodySchema>;
  try {
    body = bodySchema.parse(await request.json());
  } catch (err) {
    const message = err instanceof z.ZodError ? err.issues[0]?.message : "Bad request";
    return NextResponse.json({ error: message ?? "Bad request" }, { status: 400 });
  }

  const search = await getSearchForSession(body.searchId, sessionId);
  if (!search) {
    return NextResponse.json({ error: "Поиск не найден." }, { status: 404 });
  }

  const already = await isSearchUnlocked(search.id);
  if (already) {
    return NextResponse.json({ alreadyUnlocked: true });
  }

  const successUrl = `${env.NEXT_PUBLIC_SITE_URL}/unlock/success?searchId=${encodeURIComponent(search.id)}`;
  const cancelUrl = `${env.NEXT_PUBLIC_SITE_URL}/unlock/cancel?searchId=${encodeURIComponent(search.id)}`;

  try {
    const { checkoutUrl } = await startUnlockCheckout({
      searchId: search.id,
      successUrl,
      cancelUrl,
    });
    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("Failed to start unlock checkout", err);
    return NextResponse.json(
      { error: "Платёжный провайдер временно недоступен. Попробуйте позже." },
      { status: 502 },
    );
  }
}
