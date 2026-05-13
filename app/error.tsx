"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Unhandled application error", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-20 md:px-6">
      <p className="text-sm font-medium text-red-600">Ошибка</p>
      <h1 className="mt-3 text-headline text-brand-ink">Что-то пошло не так</h1>
      <p className="mt-4 max-w-xl text-base text-brand-muted">
        Мы уже знаем о проблеме. Попробуйте обновить страницу — если ошибка повторится, напишите на
        hello@reflector.app, упомяните код {error.digest ?? "no-digest"}.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-btn bg-brand-ink px-5 py-3 text-sm font-medium text-white shadow-cta transition-colors hover:bg-brand-accent"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Попробовать снова
      </button>
    </main>
  );
}
