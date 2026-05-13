import "server-only";
import { env } from "./env";

/**
 * Извлечение клиентского IP из заголовков.
 *
 * **Доверять X-Forwarded-For / X-Real-IP можно ТОЛЬКО когда сервер за известным
 * reverse-proxy** (Vercel, Cloudflare, nginx с явной конфигурацией). Иначе клиент может
 * подделать заголовок и угнать чужой rate-limit-bucket. Управляется через
 * `TRUST_PROXY_HEADERS` env (по умолчанию false для local dev).
 *
 * Возвращает `null`, если IP неизвестен или заголовкам нельзя доверять — это
 * сигнал вызывающему коду использовать sessionId как ключ.
 */
export function getClientIp(request: Request): string | null {
  if (!env.TRUST_PROXY_HEADERS) return null;
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = request.headers.get("x-real-ip");
  return real?.trim() || null;
}

/**
 * Строит ключ для rate-limit'а, предпочитая sessionId (HMAC-signed, не подделать клиентом).
 * IP идёт как fallback и только при `TRUST_PROXY_HEADERS=true`.
 *
 * Для webhook'ов sessionId отсутствует — там единственная защита это подпись провайдера,
 * rate-limit ставится поверх неё как defence in depth.
 */
export function getRateLimitKey(
  routeKey: string,
  options: { sessionId?: string | null; request?: Request },
): string {
  const { sessionId, request } = options;
  if (sessionId) return `${routeKey}:s:${sessionId}`;
  if (request) {
    const ip = getClientIp(request);
    if (ip) return `${routeKey}:i:${ip}`;
  }
  return `${routeKey}:anon`;
}
