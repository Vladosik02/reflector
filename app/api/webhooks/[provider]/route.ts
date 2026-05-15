import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { getPaymentProvider } from "@/lib/payments";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/request";
import { handleWebhookEvent } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Generic webhook handler. The route must match the active `PAYMENT_PROVIDER` —
 * this prevents an attacker from hitting `/api/webhooks/stripe` while in dev mode.
 */
export async function POST(
  request: Request,
  ctx: { params: Promise<{ provider: string }> },
): Promise<NextResponse> {
  const { provider: providerName } = await ctx.params;

  if (providerName !== env.PAYMENT_PROVIDER) {
    // 503: the route exists, but the active provider is different. We use 503 so
    // that Stripe retries on misconfiguration, while an attacker does not get a plain 404.
    return NextResponse.json(
      { error: `Webhook provider not active. Active: ${env.PAYMENT_PROVIDER}` },
      { status: 503 },
    );
  }

  // Webhooks come from an external provider — sessionId is unavailable. Rate limiting here
  // is defence-in-depth on top of signature verification; IP is trusted only when TRUST_PROXY_HEADERS=true.
  const limit = checkRateLimit(getRateLimitKey(`webhook:${providerName}`, { request }), 120);
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
