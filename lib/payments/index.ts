import "server-only";
import { env } from "../env";
import { MockPaymentProvider } from "./mock";
import { StripePaymentProvider } from "./stripe";
import type { PaymentProvider } from "./types";

let cached: PaymentProvider | null = null;

export function getPaymentProvider(): PaymentProvider {
  if (cached) return cached;
  switch (env.PAYMENT_PROVIDER) {
    case "mock":
      cached = new MockPaymentProvider();
      return cached;
    case "stripe":
      cached = new StripePaymentProvider();
      return cached;
    default:
      throw new Error(`Unknown PAYMENT_PROVIDER: ${env.PAYMENT_PROVIDER}`);
  }
}

/** Только для тестов. */
export function _resetPaymentProvider(): void {
  cached = null;
}

export type { CheckoutSession, CreateCheckoutInput, PaymentProvider, WebhookEvent } from "./types";
