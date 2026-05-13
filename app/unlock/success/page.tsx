"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Промежуточная страница после оплаты:
 *  - опрашивает /api/unlock/status каждые 800 мс;
 *  - как только unlocked=true (webhook отработал) — редиректит на /search/[id];
 *  - если за 20 секунд webhook не пришёл, показывает CTA «Попробовать ещё раз».
 */
export default function UnlockSuccessPage() {
  const params = useSearchParams();
  const router = useRouter();
  const searchId = params.get("searchId");

  const [status, setStatus] = useState<"polling" | "ready" | "timeout" | "error">("polling");

  useEffect(() => {
    if (!searchId) {
      setStatus("error");
      return;
    }

    const controller = new AbortController();
    let attempts = 0;
    const maxAttempts = 25; // ~20 сек при интервале 800 мс

    const poll = async () => {
      while (!controller.signal.aborted && attempts < maxAttempts) {
        attempts += 1;
        try {
          const res = await fetch(`/api/unlock/status?searchId=${encodeURIComponent(searchId)}`, {
            cache: "no-store",
            signal: controller.signal,
          });
          if (res.ok) {
            const data = (await res.json()) as { unlocked: boolean };
            if (data.unlocked) {
              if (!controller.signal.aborted) {
                setStatus("ready");
                router.replace(`/search/${searchId}`);
              }
              return;
            }
          }
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") return;
          // network blip — продолжаем поллинг
        }
        await new Promise<void>((resolve) => {
          const t = setTimeout(resolve, 800);
          controller.signal.addEventListener("abort", () => {
            clearTimeout(t);
            resolve();
          });
        });
      }
      if (!controller.signal.aborted) setStatus("timeout");
    };

    void poll();
    return () => controller.abort();
  }, [searchId, router]);

  return (
    <>
      <Header />
      <main
        className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-16 text-center"
        role="status"
        aria-live="polite"
      >
        {status === "polling" && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-brand-accent" aria-hidden="true" />
            <h1 className="mt-6 text-headline text-brand-ink">Подтверждаем платёж...</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              Это занимает несколько секунд. Не закрывайте страницу — мы откроем результаты сразу,
              как только провайдер подтвердит оплату.
            </p>
          </>
        )}
        {status === "ready" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
            <h1 className="mt-6 text-headline text-brand-ink">Готово</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">Открываем результаты...</p>
          </>
        )}
        {status === "timeout" && (
          <>
            <h1 className="text-headline text-brand-ink">Платёж в обработке</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              Подтверждение от провайдера задерживается. Это нормально для первого платежа.
              Перейдите к результатам — мы откроем премиум-совпадения, как только подтверждение
              придёт.
            </p>
            {searchId && (
              <button
                type="button"
                onClick={() => router.push(`/search/${searchId}`)}
                className="mt-8 inline-flex items-center gap-2 rounded-btn bg-brand-ink px-5 py-3 text-sm font-medium text-white shadow-cta hover:bg-brand-accent"
              >
                Открыть результаты
              </button>
            )}
          </>
        )}
        {status === "error" && (
          <div role="alert">
            <h1 className="text-headline text-brand-ink">Не хватает данных</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              Ссылка устарела. Если вы только что оплатили — вернитесь на главную и загрузите фото
              ещё раз; если разблокировка прошла, она применится автоматически.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
