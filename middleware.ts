import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE_OPTIONS,
  buildSessionCookieValue,
  createSessionId,
  verifySessionCookie,
} from "@/lib/session";

/**
 * Выдаём подписанный anonymous-cookie на первом запросе.
 * НЕ пишем в БД — запись AnonymousSession делается лениво на первом write-роуте,
 * чтобы боты и предсканеры не засоряли таблицу.
 */
export function middleware(req: NextRequest): NextResponse {
  const res = NextResponse.next();
  const existing = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!existing || !verifySessionCookie(existing)) {
    const sid = createSessionId();
    res.cookies.set(SESSION_COOKIE_NAME, buildSessionCookieValue(sid), SESSION_COOKIE_OPTIONS);
  }
  return res;
}

export const config = {
  matcher: [
    // Все маршруты, кроме статики Next, картинок и публичных файлов.
    "/((?!_next/static|_next/image|favicon.svg|manifest.webmanifest|mock|api/webhooks).*)",
  ],
};
