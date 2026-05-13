import "server-only";
import Stripe from "stripe";
import { env } from "../env";
import type { CheckoutSession, CreateCheckoutInput, PaymentProvider, WebhookEvent } from "./types";

/**
 * Stripe Checkout Sessions для разового платежа.
 * Scaffolding: код работает как только подставлены реальные `STRIPE_SECRET_KEY` и
 * `STRIPE_WEBHOOK_SECRET`. Без них импорт этого файла безопасен, но фактический вызов упадёт.
 */
export class StripePaymentProvider implements PaymentProvider {
  name = "stripe";
  private stripe: Stripe;

  constructor() {
    if (!env.STRIPE_SECRET_KEY) {
      throw new Error("StripePaymentProvider: STRIPE_SECRET_KEY is required");
    }
    this.stripe = new Stripe(env.STRIPE_SECRET_KEY);
  }

  async createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession> {
    const session = await this.stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: input.currency,
            unit_amount: input.amountMinor,
            product_data: { name: input.productName },
          },
        },
      ],
      client_reference_id: input.searchId,
      payment_intent_data: { metadata: { searchId: input.searchId } },
      metadata: { searchId: input.searchId },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
    });

    if (!session.url) {
      throw new Error("Stripe Checkout session created without url");
    }

    return { url: session.url, providerSessionId: session.id };
  }

  async verifyAndParseWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent> {
    if (!env.STRIPE_WEBHOOK_SECRET) {
      throw new Error("STRIPE_WEBHOOK_SECRET is required to verify webhooks");
    }
    if (!signature) {
      throw new Error("missing Stripe-Signature header");
    }

    const event = this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      env.STRIPE_WEBHOOK_SECRET,
    );

    let searchId: string | null = null;
    let providerSessionId: string | null = null;
    let isCompletedCheckout = false;

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      providerSessionId = session.id;
      searchId =
        session.client_reference_id ??
        (typeof session.metadata?.searchId === "string" ? session.metadata.searchId : null);
      isCompletedCheckout = session.payment_status === "paid";
    }

    return {
      providerEventId: event.id,
      eventType: event.type,
      isCompletedCheckout,
      searchId,
      providerSessionId,
    };
  }
}
