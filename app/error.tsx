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
      <p className="text-sm font-medium text-brand-danger">Error</p>
      <h1 className="mt-3 text-headline text-white">Something went wrong</h1>
      <p className="mt-4 max-w-xl text-base text-brand-muted">
        We already know about the issue. Try refreshing the page — if the error persists, email
        hello@reflector.app and include code {error.digest ?? "no-digest"}.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Try again
      </button>
    </main>
  );
}
