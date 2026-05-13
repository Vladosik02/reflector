import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "./db";
import { env } from "./env";
import { getPaymentProvider } from "./payments";
import type { WebhookEvent } from "./payments";

/**
 * Бизнес-логика unlock-флоу.
 * Изолирована от HTTP — чтобы можно было тестировать без route-handler'ов.
 */

export async function ensureAnonymousSession(sessionId: string): Promise<void> {
  await db.anonymousSession.upsert({
    where: { id: sessionId },
    update: { lastSeen: new Date() },
    create: { id: sessionId },
  });
}

export async function createSearch(input: {
  sessionId: string;
  photoHash: string;
  sources: string[];
}): Promise<{ id: string }> {
  const id = crypto.randomUUID();
  await db.search.create({
    data: {
      id,
      sessionId: input.sessionId,
      photoHash: input.photoHash,
      sources: input.sources,
    },
  });
  return { id };
}

export async function getSearchForSession(
  searchId: string,
  sessionId: string,
): Promise<{ id: string; photoHash: string; sources: string[] } | null> {
  const row = await db.search.findFirst({
    where: { id: searchId, sessionId },
    select: { id: true, photoHash: true, sources: true },
  });
  return row;
}

export async function isSearchUnlocked(searchId: string): Promise<boolean> {
  const row = await db.unlock.findUnique({ where: { searchId }, select: { id: true } });
  return Boolean(row);
}

/**
 * Создаёт Payment-запись и Checkout-сессию у провайдера.
 * Возвращает URL для редиректа.
 */
export async function startUnlockCheckout(input: {
  searchId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<{ checkoutUrl: string }> {
  const existingUnlock = await db.unlock.findUnique({ where: { searchId: input.searchId } });
  if (existingUnlock) {
    return { checkoutUrl: input.successUrl };
  }

  const provider = getPaymentProvider();
  const session = await provider.createCheckout({
    searchId: input.searchId,
    amountMinor: env.UNLOCK_PRICE_MINOR,
    currency: env.UNLOCK_CURRENCY,
    productName: "Reflector — разблокировка премиум-источников",
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
  });

  await db.payment.create({
    data: {
      searchId: input.searchId,
      provider: provider.name,
      providerSessionId: session.providerSessionId,
      status: "PENDING",
      amountMinor: env.UNLOCK_PRICE_MINOR,
      currency: env.UNLOCK_CURRENCY,
    },
  });

  return { checkoutUrl: session.url };
}

export type WebhookOutcome =
  | { kind: "duplicate" }
  | { kind: "ignored"; reason: string }
  | { kind: "applied"; searchId: string };

/**
 * Идемпотентная обработка webhook'а.
 *
 * Контракт: вызывающий код уже верифицировал подпись и распарсил событие через
 * `provider.verifyAndParseWebhook`. Эта функция отвечает только за БД-сторону.
 *
 * Алгоритм:
 *   1. INSERT ProcessedWebhookEvent с UNIQUE eventId.
 *   2. Если упало с P2002 — событие уже обработано, возвращаем `duplicate`.
 *   3. Иначе — если это успешный checkout, создаём Unlock (тоже с UNIQUE searchId).
 */
export async function handleWebhookEvent(
  event: WebhookEvent,
  providerName: string,
): Promise<WebhookOutcome> {
  try {
    await db.processedWebhookEvent.create({
      data: {
        eventId: event.providerEventId,
        provider: providerName,
        eventType: event.eventType,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { kind: "duplicate" };
    }
    throw e;
  }

  if (!event.isCompletedCheckout) {
    return { kind: "ignored", reason: `event ${event.eventType} not a completed checkout` };
  }
  if (!event.searchId) {
    return { kind: "ignored", reason: "completed checkout without searchId" };
  }

  const search = await db.search.findUnique({
    where: { id: event.searchId },
    select: { id: true, sessionId: true },
  });
  if (!search) {
    return { kind: "ignored", reason: `search ${event.searchId} not found` };
  }

  // Authoritative check: webhook event must correspond to a PENDING Payment row we created
  // in `/api/unlock`. Prevents (a) forged events for someone else's search and (b) claims with
  // no initiated checkout.
  //
  // If providerSessionId is absent on the event (some providers omit it), narrow by PENDING
  // status. Passing `undefined` directly to Prisma drops the filter entirely — Prisma would
  // then return ANY Payment for this search, including stale or unrelated ones.
  const payment = await db.payment.findFirst({
    where: {
      searchId: search.id,
      ...(event.providerSessionId
        ? { providerSessionId: event.providerSessionId }
        : { status: "PENDING" }),
    },
    select: { id: true, status: true },
  });
  if (!payment) {
    return {
      kind: "ignored",
      reason: "no Payment row matches search + providerSessionId — refusing to unlock",
    };
  }

  try {
    await db.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: "SUCCEEDED", completedAt: new Date() },
      });
      await tx.unlock.create({
        data: {
          sessionId: search.sessionId,
          searchId: search.id,
          providerEventId: event.providerEventId,
          paymentId: payment.id,
        },
      });
    });
  } catch (e) {
    // Гонка: unlock уже создан параллельным запросом — это нормально для идемпотентности.
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      (e.code === "P2002" || e.code === "P2025")
    ) {
      return { kind: "duplicate" };
    }
    throw e;
  }

  return { kind: "applied", searchId: search.id };
}
