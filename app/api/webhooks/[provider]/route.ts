import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleWebhookEvent } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Универсальный webhook handler. Маршрут должен совпадать с активным `PAYMENT_PROVIDER` —
 * это защищает от того, что злоумышленник постучится на `/api/webhooks/stripe` в dev-режиме.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider: providerName } = await ctx.params;

  if (providerName !== env.PAYMENT_PROVIDER) {
    // 503: маршрут существует, но активный провайдер другой. Используем 503, чтобы
    // Stripe в случае мис-конфигурации делал retry, а атакующий не получал «404 not found».
    return NextResponse.json(
      { error: `Webhook provider not active. Active: ${env.PAYMENT_PROVIDER}` },
      { status: 503 },
    );
  }

  const ip = request.headers.get("x-real-ip") ?? "unknown";
  const limit = checkRateLimit(`webhook:${providerName}:${ip}`, 120);
  if (!limit.allowed) {
    return NextResponse.json({ error: "Too many webhook attempts" }, { status: 429 });
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json({ error: "Cannot read body" }, { status: 400 });
  }

  let signature: string | null = null;
  if (providerName === "stripe") {
    signature = request.headers.get("stripe-signature");
  }

  const provider = getPaymentProvider();
  let event;
  try {
    event = await provider.verifyAndParseWebhook(rawBody, signature);
  } catch (err) {
    console.warn("webhook signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const outcome = await handleWebhookEvent(event, providerName);
    return NextResponse.json({ ok: true, outcome }, { status: 200 });
  } catch (err) {
    console.error("webhook handler failed", err);
    return NextResponse.json({ error: "internal error" }, { status: 500 });
  }
}
