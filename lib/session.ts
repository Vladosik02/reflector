import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { env } from "./env";

/**
 * Гостевая anonymous-сессия: opaque 256-bit id в подписанном HttpOnly cookie.
 * Cookie-формат: `<base64url(id)>.<base64url(hmac)>` — подпись защищает от
 * подделки id клиентом (session fixation). Сам id потом ищется в БД.
 *
 * Создаётся лениво — middleware только проверяет наличие, фактическая запись
 * AnonymousSession в БД происходит при первом write-запросе.
 */

export const SESSION_COOKIE_NAME = "rfl_sid";
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 дней

export function createSessionId(): string {
  return randomBytes(32).toString("base64url");
}

function sign(payload: string): string {
  const mac = createHmac("sha256", env.SESSION_COOKIE_SECRET).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

export function verifySessionCookie(value: string | undefined): string | null {
  if (!value) return null;
  const lastDot = value.lastIndexOf(".");
  if (lastDot <= 0) return null;
  const payload = value.slice(0, lastDot);
  const mac = value.slice(lastDot + 1);

  const expected = createHmac("sha256", env.SESSION_COOKIE_SECRET)
    .update(payload)
    .digest("base64url");
  const a = Buffer.from(mac, "base64url");
  const b = Buffer.from(expected, "base64url");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;

  return payload;
}

export function buildSessionCookieValue(sessionId: string): string {
  return sign(sessionId);
}

/**
 * Возвращает session id из cookie, валидируя подпись.
 * Если cookie нет или подпись неверна — возвращает null.
 *
 * Динамический импорт `next/headers` — чтобы модуль оставался импортируемым
 * из тестов с jsdom (server-only ничего не делает в vitest, но `next/headers`
 * требует RSC-контекст).
 */
export async function readSessionId(): Promise<string | null> {
  const { cookies } = await import("next/headers");
  const c = await cookies();
  return verifySessionCookie(c.get(SESSION_COOKIE_NAME)?.value);
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};
