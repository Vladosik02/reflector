import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { getRateLimitKey } from "@/lib/request";
import { readSessionId } from "@/lib/session";
import { getSearchForSession, isSearchUnlocked } from "@/lib/unlock-service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const sessionId = await readSessionId();
  if (!sessionId) {
    return NextResponse.json({ error: "Сессия не инициализирована." }, { status: 401 });
  }

  // /unlock/success опрашивает это каждые 800 мс ~ до 25 раз. Лимит 60/мин даёт запас.
  const limit = checkRateLimit(getRateLimitKey("unlock-status", { sessionId, request }), 60);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "Слишком много запросов." },
      {
        status: 429,
        headers: { "Retry-After": Math.ceil((limit.resetAt - Date.now()) / 1000).toString() },
      },
    );
  }

  const { searchParams } = new URL(request.url);
  const searchId = searchParams.get("searchId");
  if (!searchId) {
    return NextResponse.json({ error: "searchId is required" }, { status: 400 });
  }

  const search = await getSearchForSession(searchId, sessionId);
  if (!search) {
    return NextResponse.json({ unlocked: false, found: false });
  }

  const unlocked = await isSearchUnlocked(search.id);
  return NextResponse.json({ unlocked, found: true }, { headers: { "Cache-Control": "no-store" } });
}
