/**
 * Контракт платёжного провайдера. Реализации:
 *   - mock — для разработки, мгновенный успех без внешних вызовов;
 *   - stripe — Checkout Sessions API + webhook (production-shaped, нужен мерчант).
 *
 * Выбор провайдера — через ENV `PAYMENT_PROVIDER`.
 *
 * Принципы:
 *  - Только сервер. Никаких client-side ключей.
 *  - `searchId` пробрасывается в metadata и `client_reference_id` для надёжной корреляции webhook → search.
 *  - Webhook должен быть идемпотентным: тот же `providerEventId` не должен приводить к двойному unlock.
 */

export interface CreateCheckoutInput {
  searchId: string;
  amountMinor: number;
  currency: string;
  productName: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutSession {
  url: string;
  providerSessionId: string;
}

export interface WebhookEvent {
  /** Уникальный id события у провайдера. Используется как ключ идемпотентности. */
  providerEventId: string;
  /** Семантический тип события у провайдера ("checkout.session.completed", "payment.succeeded", ...). */
  eventType: string;
  /** Признак успешного платежа — нужно ли создавать Unlock. */
  isCompletedCheckout: boolean;
  /** searchId, извлечённый из metadata/client_reference_id. */
  searchId: string | null;
  /** id Checkout/Payment сессии у провайдера, если есть. */
  providerSessionId: string | null;
}

export interface PaymentProvider {
  name: string;
  createCheckout(input: CreateCheckoutInput): Promise<CheckoutSession>;
  /**
   * Проверяет подпись raw-тела webhook'а и парсит событие в наш WebhookEvent.
   * Бросает ошибку, если подпись невалидна.
   */
  verifyAndParseWebhook(rawBody: string, signature: string | null): Promise<WebhookEvent>;
}
