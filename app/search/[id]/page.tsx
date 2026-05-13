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
        setError("Поиск не найден или принадлежит другой сессии.");
        return;
      }
      if (!res.ok) {
        setError(`Ошибка ${res.status}.`);
        return;
      }
      const fresh = (await res.json()) as MatchResponse;
      setData(fresh);
    } catch {
      setError("Не удалось загрузить результаты.");
    }
  }, [id]);

  useEffect(() => {
    void fetchSearch();
  }, [fetchSearch]);

  // Перевод фокуса на h1 при первой загрузке данных. SR-пользователь и keyboard-юзер
  // ориентируются по «заголовку страницы», когда переходят /unlock/success → /search/[id].
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
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />К новой загрузке
        </button>

        <div className="mt-6 max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">Результаты поиска</span>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-headline text-brand-ink outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-4"
          >
            {data?.unlocked ? "Премиум-совпадения разблокированы" : "Совпадения по вашему фото"}
          </h1>
          <p className="mt-4 text-base text-brand-muted">
            Сравнение «вы / совпадение» в этой проекции недоступно (фото удалено из соображений
            приватности). Видны только итоговые совпадения и их источники.
          </p>
        </div>

        {error && (
          <p
            className="mt-8 rounded-card border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        )}

        {!data && !error && (
          <div className="mt-12 flex items-center gap-3 text-brand-muted">
            <Loader2 className="h-5 w-5 animate-spin text-brand-accent" aria-hidden="true" />
            Загружаем результаты...
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
