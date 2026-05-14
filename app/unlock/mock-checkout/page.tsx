"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, Loader2, X } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { cn } from "@/lib/cn";

/**
 * Имитация Stripe Checkout — только для разработки.
 * Кнопка «Оплатить» постит на /api/webhooks/mock (тот самый webhook, что Stripe вызывал бы),
 * затем редиректит на success_url. Это позволяет end-to-end протестировать unlock-флоу
 * без реального мерчанта.
 */
export default function MockCheckoutPage() {
  const params = useSearchParams();
  const router = useRouter();

  const searchId = params.get("searchId");
  const sessionId = params.get("sessionId");
  const eventId = params.get("eventId");
  const amount = params.get("amount");
  const currency = params.get("currency") ?? "rub";
  const rawSuccess = params.get("success");
  const rawCancel = params.get("cancel");
  const success = sanitizeRedirect(rawSuccess);
  const cancel = sanitizeRedirect(rawCancel);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = Boolean(searchId && eventId && success && cancel);

  const handlePay = async () => {
    if (!ready || !success) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/webhooks/mock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, searchId, providerSessionId: sessionId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Не удалось завершить оплату.");
        setSubmitting(false);
        return;
      }
      router.push(success);
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <main className="mx-auto max-w-md px-4 py-12 md:py-20">
        <div className="rounded-card border border-brand-line bg-brand-surface p-8 shadow-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-btn bg-brand-bg text-brand-accent">
              <CreditCard className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-brand-subtle">
                Mock checkout · dev
              </p>
              <p className="text-base font-semibold text-brand-ink">
                Имитация платёжного провайдера
              </p>
            </div>
          </div>

          <dl className="mt-8 space-y-3 text-sm">
            <Row label="Услуга" value="Разблокировка премиум-источников" />
            <Row label="Поиск" value={searchId ?? "—"} mono />
            <Row label="Сумма" value={formatAmount(amount, currency)} />
          </dl>

          {error && (
            <p
              className="mt-6 rounded-btn border border-brand-danger/40 bg-brand-danger/10 p-3 text-sm text-brand-danger"
              role="alert"
            >
              {error}
            </p>
          )}

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handlePay}
              disabled={!ready || submitting}
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all",
                !ready || submitting
                  ? "cursor-not-allowed opacity-60"
                  : "hover:-translate-y-0.5 hover:shadow-cta-hover",
              )}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {submitting ? "Обработка..." : `Оплатить ${formatAmount(amount, currency)}`}
            </button>
            <button
              type="button"
              onClick={() => cancel && router.push(cancel)}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-btn border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-muted hover:text-brand-ink"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Отменить
            </button>
          </div>

          <p className="mt-6 text-xs leading-relaxed text-brand-subtle">
            Это dev-страница. В production она будет заменена на Stripe Checkout (или ЮKassa),
            хостимый платёжным провайдером. Никаких реальных списаний здесь не происходит.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-brand-subtle">{label}</dt>
      <dd className={cn("text-right text-brand-ink", mono && "font-mono text-xs")}>{value}</dd>
    </div>
  );
}

/**
 * Защита от open-redirect: возвращаем только путь+query, отбрасывая хост.
 * Mock-провайдер передаёт абсолютный URL `${env.NEXT_PUBLIC_SITE_URL}/unlock/...`;
 * мы извлекаем только pathname+search и редиректим относительно текущего origin.
 */
function sanitizeRedirect(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value, "http://placeholder.local");
    if (!parsed.pathname.startsWith("/unlock/") && !parsed.pathname.startsWith("/search/")) {
      return null;
    }
    return parsed.pathname + parsed.search;
  } catch {
    return null;
  }
}

function formatAmount(amount: string | null, currency: string): string {
  if (!amount) return "—";
  const num = Number.parseInt(amount, 10);
  if (Number.isNaN(num)) return "—";
  const symbol = currency.toLowerCase() === "rub" ? "₽" : currency.toUpperCase();
  return `${(num / 100).toLocaleString("ru-RU")} ${symbol}`;
}
