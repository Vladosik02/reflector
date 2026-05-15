"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Results } from "@/components/Results";
import type { PublicMatch } from "@/lib/face-match";
import { useUnlock } from "@/lib/hooks/useUnlock";

interface SearchPageProps {
  params: Promise<{ id: string }>;
}

interface MatchResponse {
  searchId: string;
  unlocked: boolean;
  matches: PublicMatch[];
  retentionSeconds: number;
  unlockPrice: { amountMinor: number; currency: string };
}

export default function SearchPage({ params }: SearchPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const fetchSearch = useCallback(async () => {
    try {
      const res = await fetch(`/api/search/${id}`, { cache: "no-store" });
      if (res.status === 404) {
        setError("Search not found or belongs to another session.");
        return;
      }
      if (!res.ok) {
        setError(`Error ${res.status}.`);
        return;
      }
      const fresh = (await res.json()) as MatchResponse;
      setData(fresh);
    } catch {
      setError("Failed to load results.");
    }
  }, [id]);

  useEffect(() => {
    void fetchSearch();
  }, [fetchSearch]);

  // Move focus to the h1 once data first loads. Screen-reader and keyboard users
  // orient themselves by the "page heading" when transitioning /unlock/success → /search/[id].
  useEffect(() => {
    if (data && headingRef.current) {
      headingRef.current.focus();
    }
  }, [data]);

  const { handleUnlock, isUnlocking } = useUnlock(data?.searchId ?? null, {
    onAlreadyUnlocked: fetchSearch,
    onError: setError,
  });

  return (
    <>
      <Header />
      <main className="mx-auto max-w-site px-4 py-12 md:px-6 md:py-16">
        <button
          type="button"
          onClick={() => router.push("/#upload")}
          className="inline-flex items-center gap-2 text-sm text-brand-muted hover:text-brand-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          New upload
        </button>

        <div className="mt-6 max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">Search results</span>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-headline text-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-4"
          >
            {data?.unlocked ? "Premium matches unlocked" : "Matches for your photo"}
          </h1>
          <p className="mt-4 text-base text-brand-muted">
            The &ldquo;you / match&rdquo; side-by-side view is unavailable here (the photo was
            deleted for privacy reasons). Only the final matches and their sources are shown.
          </p>
        </div>

        {error && (
          <p
            className="mt-8 rounded-card border border-brand-danger/40 bg-brand-danger/10 p-4 text-sm text-brand-danger"
            role="alert"
          >
            {error}
          </p>
        )}

        {!data && !error && (
          <div className="mt-12 flex items-center gap-3 text-brand-muted">
            <Loader2 className="h-5 w-5 animate-spin text-brand-accent" aria-hidden="true" />
            Loading results...
          </div>
        )}

        {data && (
          <Results
            searchId={data.searchId}
            userPhotoUrl={null}
            matches={data.matches}
            unlocked={data.unlocked}
            unlockPrice={data.unlockPrice}
            onUnlockClick={handleUnlock}
            isUnlocking={isUnlocking}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
