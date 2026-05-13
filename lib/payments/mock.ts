import "server-only";
import { randomUUID } from "node:crypto";
import type { CheckoutSession, CreateCheckoutInput, PaymentProvider, WebhookEvent } from "./types";

/**
 * Mock-провайдер: возвращает URL фейкового checkout'а, который ведёт сразу на success-страницу
 * с query-параметром `mock_unlock=<searchId>&event=<eventId>`. Реальные пользователи никогда сюда
 * не попадут — это только для разработки. Внешних вызовов нет.
 *
 * Webhook симулируется success-страницей: она POST'ит на `/api/webhooks/mock` с payload,
 * содержащим event id и searchId. Mock-провайдер верифицирует payload по shared secret
 * (берём SESSION_COOKIE_SECRET для простоты — это же dev-only).
 */
export class MockPaymentProvider implements PaymentProvider {
  name = "mock";

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const providerSessionId = `mock_cs_${randomUUID().replace(/-/g, "")}`;
    const eventId = `mock_evt_${randomUUID().replace(/-/g, "")}`;
    const url =
      `/unlock/mock-checkout` +
      `?searchId=${encodeURIComponent(input.searchId)}` +
      `&sessionId=${encodeURIComponent(providerSessionId)}` +
      `&eventId=${encodeURIComponent(eventId)}` +
      `&amount=${input.amountMinor}` +
      `&currency=${encodeURIComponent(input.currency)}` +
      `&success=${encodeURIComponent(input.successUrl)}` +
      `&cancel=${encodeURIComponent(input.cancelUrl)}`;
    return { url, providerSessionId };
  }

  async verifyAndParseWebhook(rawBody: string, _signature: string | null): Promise<WebhookEvent> {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "mock webhook is disabled in production — set PAYMENT_PROVIDER=stripe and use /api/webhooks/stripe",
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      throw new Error("mock webhook: invalid JSON body");
    }
    if (!parsed || typeof parsed !== "object") {
      throw new Error("mock webhook: payload must be object");
    }
    const obj = parsed as Record<string, unknown>;
    const eventId = obj.eventId;
    const searchId = obj.searchId;
    const providerSessionId = obj.providerSessionId;

    if (typeof eventId !== "string" || !eventId) {
      throw new Error("mock webhook: eventId missing");
    }
    if (typeof searchId !== "string" || !searchId) {
      throw new Error("mock webhook: searchId missing");
    }

    return {
      providerEventId: eventId,
      eventType: "mock.checkout.completed",
      isCompletedCheckout: true,
      searchId,
      providerSessionId: typeof providerSessionId === "string" ? providerSessionId : null,
    };
  }
}
