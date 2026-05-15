"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Interstitial page shown after payment:
 *  - polls /api/unlock/status every 800ms;
 *  - once unlocked=true (the webhook fired), redirects to /search/[id];
 *  - if the webhook does not arrive within 20 seconds, shows a "Try again" CTA.
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
    const maxAttempts = 25; // ~20s at an 800ms interval

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
          // network blip — keep polling
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
            <h1 className="mt-6 text-headline text-brand-ink">Confirming payment...</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              This takes a few seconds. Please keep this page open — we will open your results as
              soon as the provider confirms the payment.
            </p>
          </>
        )}
        {status === "ready" && (
          <>
            <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden="true" />
            <h1 className="mt-6 text-headline text-brand-ink">Done</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">Opening your results...</p>
          </>
        )}
        {status === "timeout" && (
          <>
            <h1 className="text-headline text-brand-ink">Payment is being processed</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              The provider is taking longer than usual to confirm. This is normal for a first
              payment. Go to results — we will unlock the premium matches as soon as the
              confirmation arrives.
            </p>
            {searchId && (
              <button
                type="button"
                onClick={() => router.push(`/search/${searchId}`)}
                className="mt-8 inline-flex items-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
              >
                Go to results
              </button>
            )}
          </>
        )}
        {status === "error" && (
          <div role="alert">
            <h1 className="text-headline text-brand-ink">Missing data</h1>
            <p className="mt-4 max-w-md text-base text-brand-muted">
              The link is no longer valid. If you just paid, return to the home page and upload your
              photo again; if the unlock went through, it will apply automatically.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
