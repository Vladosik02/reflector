"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, Info, Loader2, Upload, X } from "lucide-react";
import { upload } from "@/lib/content";
import { cn } from "@/lib/cn";
import type { MatchSource, PublicMatch } from "@/lib/face-match";
import { Results } from "./Results";

const IS_STATIC_PREVIEW = process.env.NEXT_PUBLIC_STATIC_EXPORT === "true";

const MAX_BYTES = 15 * 1024 * 1024;
const ACCEPT = ["image/jpeg", "image/png", "image/webp"];

type Status = "idle" | "submitting" | "success" | "error";

interface MatchResponse {
  searchId: string;
  unlocked: boolean;
  matches: PublicMatch[];
  retentionSeconds: number;
  unlockPrice: { amountMinor: number; currency: string };
}

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<MatchSource>>(
    () => new Set<MatchSource>(["public", "models", "sports", "archive"]),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      abortRef.current?.abort();
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    (next: File | null) => {
      setError(null);
      setStatus("idle");
      setResponse(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (!next) {
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      if (!ACCEPT.includes(next.type)) {
        setError("Поддерживаются только JPG, PNG и WEBP.");
        return;
      }
      if (next.size > MAX_BYTES) {
        setError("Файл слишком большой. Максимум 15 МБ.");
        return;
      }

      setFile(next);
      setPreviewUrl(URL.createObjectURL(next));
    },
    [previewUrl],
  );

  const toggleFilter = (id: MatchSource) => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = async () => {
    if (!file) return;
    if (activeFilters.size === 0) {
      setError("Выберите хотя бы один источник поиска.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setStatus("submitting");
    setResponse(null);

    const formData = new FormData();
    formData.append("photo", file);
    formData.append("sources", JSON.stringify(Array.from(activeFilters)));

    try {
      const res = await fetch("/api/match", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Ошибка ${res.status}. Попробуйте ещё раз.`);
        setStatus("error");
        return;
      }

      const data = (await res.json()) as MatchResponse;
      setResponse(data);
      setStatus("success");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Не удалось связаться с сервером. Проверьте соединение.");
      setStatus("error");
    }
  };

  const handleUnlock = async () => {
    if (!response) return;
    setIsUnlocking(true);
    try {
      const res = await fetch("/api/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchId: response.searchId }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "Не удалось начать оплату.");
        setIsUnlocking(false);
        return;
      }
      const data = (await res.json()) as { checkoutUrl?: string; alreadyUnlocked?: boolean };
      if (data.alreadyUnlocked) {
        await refresh();
        setIsUnlocking(false);
        return;
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      setIsUnlocking(false);
    } catch {
      setError("Не удалось связаться с платёжным сервисом.");
      setIsUnlocking(false);
    }
  };

  const refresh = useCallback(async () => {
    if (!response) return;
    const res = await fetch(`/api/search/${response.searchId}`, { cache: "no-store" });
    if (res.ok) {
      const fresh = (await res.json()) as MatchResponse;
      setResponse(fresh);
    }
  }, [response]);

  const isSubmitting = status === "submitting";

  return (
    <section id="upload" className="border-t border-brand-line bg-brand-surface">
      <div className="mx-auto max-w-site px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">Найти двойника</span>
          <h2 className="mt-3 text-headline text-brand-ink">{upload.title}</h2>
          <p className="mt-4 text-base text-brand-muted">{upload.description}</p>
        </div>

        {IS_STATIC_PREVIEW && <StaticPreviewBanner />}

        <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-card border border-brand-line bg-brand-bg p-6">
            <h3 className="text-sm font-semibold text-brand-ink">Источники поиска</h3>
            <p className="mt-2 text-xs text-brand-subtle">
              Публичная база — бесплатно. Премиум-источники (модели, спорт, архивы) — за фикс. цену,
              разово, без подписки.
            </p>

            <div className="mt-5 space-y-2">
              {upload.filters.map((f) => {
                const active = activeFilters.has(f.id);
                const isPremium = f.id !== "public";
                return (
                  <label
                    key={f.id}
                    className={cn(
                      "flex cursor-pointer items-center justify-between rounded-btn border px-3 py-2 text-sm transition-colors",
                      active
                        ? "border-brand-ink bg-brand-surface text-brand-ink"
                        : "border-brand-line text-brand-muted hover:border-brand-ink/40",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {f.label}
                      {isPremium && (
                        <span className="rounded-full bg-brand-warning/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-warning">
                          Премиум
                        </span>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleFilter(f.id)}
                      className="h-4 w-4 accent-brand-ink"
                      aria-label={f.label}
                    />
                  </label>
                );
              })}
            </div>

            <p className="mt-6 rounded-btn border border-brand-line bg-brand-surface p-3 text-xs leading-relaxed text-brand-muted">
              Премиум-источники сначала возвращаются <span className="font-medium">размытыми</span>.
              Один платёж — и все размытые совпадения этого поиска становятся видимыми.
            </p>
          </aside>

          <div className="flex flex-col gap-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const f = e.dataTransfer.files?.[0] ?? null;
                handleFile(f);
              }}
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={upload.dropzoneLabel}
              className={cn(
                "flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-card border-2 border-dashed bg-brand-bg p-8 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-[360px] md:p-10",
                isDragging
                  ? "border-brand-accent bg-brand-accent/5"
                  : "border-brand-line hover:border-brand-ink/40",
              )}
            >
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT.join(",")}
                onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                hidden
              />

              {previewUrl ? (
                <div className="flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Превью загруженного фото"
                    className="h-40 w-40 rounded-card object-cover shadow-card md:h-48 md:w-48"
                  />
                  <p className="text-sm text-brand-muted">{file?.name}</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFile(null);
                    }}
                    className="inline-flex items-center gap-1 text-xs text-brand-subtle underline-offset-2 hover:text-brand-ink hover:underline"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    Выбрать другое фото
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="h-10 w-10 text-brand-subtle" aria-hidden="true" />
                  <p className="mt-4 text-lg font-medium text-brand-ink">{upload.dropzoneLabel}</p>
                  <p className="mt-2 text-sm text-brand-subtle">{upload.dropzoneHint}</p>
                </>
              )}

              {error && (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {error}
                </p>
              )}
            </div>

            {previewUrl && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-btn bg-brand-ink px-6 py-3 text-sm font-medium text-white shadow-cta transition-colors",
                  isSubmitting ? "cursor-not-allowed opacity-70" : "hover:bg-brand-accent",
                )}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Анализируем..." : "Найти двойников"}
              </button>
            )}
          </div>
        </div>

        {status === "submitting" && <ResultsSkeleton />}
        {status === "success" && response && previewUrl && (
          <Results
            searchId={response.searchId}
            userPhotoUrl={previewUrl}
            matches={response.matches}
            unlocked={response.unlocked}
            unlockPrice={response.unlockPrice}
            onUnlockClick={handleUnlock}
            isUnlocking={isUnlocking}
          />
        )}
        {status === "idle" && !file && <ResultsPlaceholder />}
      </div>
    </section>
  );
}

function StaticPreviewBanner() {
  return (
    <div
      role="note"
      className="mt-8 flex flex-col items-start gap-3 rounded-card border border-brand-accent/40 bg-brand-accent/5 p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-brand-ink">
            Это статический preview на GitHub Pages
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">
            Поиск, оплата и разблокировка требуют серверной части (API, БД, webhook&apos;и) и здесь
            не работают. UI ниже — рабочий, но клик «Найти двойников» не вернёт результаты. Для
            живой версии разверните app на Vercel / Railway / своём VPS — Dockerfile в репозитории.
          </p>
        </div>
      </div>
      <a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex shrink-0 items-center gap-2 rounded-btn border border-brand-line bg-brand-surface px-4 py-2 text-sm font-medium text-brand-ink hover:bg-white"
      >
        Deploy на Vercel
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-bg p-6">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-brand-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-brand-ink">Анализируем фото...</p>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="h-64 animate-pulse rounded-card border border-brand-line bg-brand-surface"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}

function ResultsPlaceholder() {
  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-bg p-6">
      <p className="text-sm font-semibold text-brand-ink">Результаты появятся здесь</p>
      <p className="mt-1 text-xs text-brand-subtle">
        Загрузите фото — увидите топ совпадений сразу. Премиум-источники придут размытыми;
        разблокируете одной оплатой за фикс. цену.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="aspect-[3/4] rounded-card border border-dashed border-brand-line bg-brand-surface"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
