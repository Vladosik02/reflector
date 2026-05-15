"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, ExternalLink, Info, Loader2, Upload, X } from "lucide-react";
import { upload } from "@/lib/content";
import { cn } from "@/lib/cn";
import type { MatchSource, PublicMatch } from "@/lib/face-match";
import { useUnlock } from "@/lib/hooks/useUnlock";
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

export default function UploadSection({ className }: { className?: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [limitReached, setLimitReached] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<MatchSource>>(
    () => new Set<MatchSource>(["public", "models", "sports", "archive"]),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [response, setResponse] = useState<MatchResponse | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const refresh = useCallback(async () => {
    if (!response) return;
    const res = await fetch(`/api/search/${response.searchId}`, { cache: "no-store" });
    if (res.ok) {
      const fresh = (await res.json()) as MatchResponse;
      setResponse(fresh);
    }
  }, [response]);

  const { handleUnlock, isUnlocking } = useUnlock(response?.searchId ?? null, {
    onAlreadyUnlocked: refresh,
    onError: setError,
  });

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      abortRef.current?.abort();
    };
  }, [previewUrl]);

  const handleFile = useCallback(
    (next: File | null) => {
      setError(null);
      setLimitReached(false);
      setStatus("idle");
      setResponse(null);

      if (previewUrl) URL.revokeObjectURL(previewUrl);

      if (!next) {
        setFile(null);
        setPreviewUrl(null);
        return;
      }

      if (!ACCEPT.includes(next.type)) {
        setError("Only JPG, PNG and WEBP are supported.");
        return;
      }
      if (next.size > MAX_BYTES) {
        setError("File too large. Max 15 MB.");
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
      setError("Select at least one search source.");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setError(null);
    setLimitReached(false);
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

      if (res.status === 429) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setLimitReached(true);
        setError(body.error ?? "Request limit reached. Try again later.");
        setStatus("error");
        return;
      }

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? `Error ${res.status}. Please try again.`);
        setStatus("error");
        return;
      }

      const data = (await res.json()) as MatchResponse;
      setResponse(data);
      setStatus("success");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError("Failed to reach the server. Check your connection.");
      setStatus("error");
    }
  };

  const isSubmitting = status === "submitting";

  return (
    <section
      id="upload"
      className={cn(
        "relative border-brand-line bg-brand-surface",
        // На мобильном секция идёт первой — border-t не нужен. На lg+ восстанавливаем.
        "border-t-0 lg:border-t",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-0 hidden h-96 w-96 rounded-full bg-orb-violet opacity-40 blur-3xl md:block"
      />
      <div className="relative mx-auto max-w-site px-6 py-6 lg:py-24">
        {/* Mobile-only лаконичный заголовок. */}
        <h1 className="text-2xl font-semibold text-brand-ink lg:hidden">{upload.mobileTitle}</h1>

        {/* Desktop-only богатый блок: eyebrow + h2 + description. */}
        <div className="hidden max-w-2xl lg:block">
          <span className="text-sm font-medium text-brand-info">Find your lookalike</span>
          <h2 className="mt-3 text-headline text-white">{upload.title}</h2>
          <p className="mt-4 text-base text-brand-muted">{upload.description}</p>
        </div>

        {IS_STATIC_PREVIEW && <StaticPreviewBanner />}

        <div className="mt-6 grid gap-6 lg:mt-12 lg:grid-cols-[280px_1fr]">
          <aside className="glass-top relative hidden rounded-card border border-brand-line bg-brand-elevated p-6 shadow-card lg:block">
            <h3 className="text-sm font-semibold text-white">Search sources</h3>
            <p className="mt-2 text-xs text-brand-subtle">
              The public database is free. Premium sources (models, sports, archives) cost a flat,
              one-time fee — no subscription.
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
                        ? "border-brand-accent bg-brand-accent-soft text-white"
                        : "border-brand-line text-brand-muted hover:border-brand-accent/40 hover:text-white",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {f.label}
                      {isPremium && (
                        <span className="rounded-pill border border-brand-warning/30 bg-brand-warning/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-brand-warning">
                          Premium
                        </span>
                      )}
                    </span>
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleFilter(f.id)}
                      className="h-4 w-4 accent-brand-accent"
                      aria-label={f.label}
                    />
                  </label>
                );
              })}
            </div>

            <p className="mt-6 rounded-btn border border-brand-line bg-brand-surface p-3 text-xs leading-relaxed text-brand-muted">
              Premium sources are returned <span className="font-medium text-white">blurred</span>{" "}
              at first. One payment reveals every blurred match in this search.
            </p>
          </aside>

          <div className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT.join(",")}
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              hidden
            />

            {previewUrl ? (
              // Когда файл выбран, дропзона перестаёт быть кнопкой (внутри было бы вложенное
              // interactive — нарушение WCAG 2.1.1). Превью + кнопка "Выбрать другое" живут
              // в обычном div, drag-and-drop ещё работает поверх него.
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
                aria-describedby={error ? "upload-error" : "upload-hint"}
                className={cn(
                  "relative flex min-h-[320px] flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed bg-brand-bg p-8 text-center shadow-inset-line transition-all duration-300 md:min-h-[360px] md:p-10",
                  isDragging
                    ? "border-brand-accent bg-brand-accent-soft shadow-glow-violet"
                    : error
                      ? "border-brand-danger/60"
                      : "border-brand-line",
                )}
              >
                <div
                  className="dot-grid pointer-events-none absolute inset-0 opacity-30"
                  aria-hidden="true"
                />
                <div className="relative flex flex-col items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt="Uploaded photo preview"
                    className="h-40 w-40 rounded-card object-cover shadow-card md:h-48 md:w-48"
                  />
                  <p className="text-sm text-brand-muted">{file?.name}</p>
                  <button
                    type="button"
                    onClick={() => handleFile(null)}
                    className="inline-flex items-center gap-1 rounded-btn px-2 py-1 text-xs text-brand-subtle underline-offset-2 hover:text-white hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
                  >
                    <X className="h-3 w-3" aria-hidden="true" />
                    Choose another photo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
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
                aria-label={upload.dropzoneLabel}
                aria-describedby={error ? "upload-error" : "upload-hint"}
                className={cn(
                  "group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-card border-2 border-dashed bg-brand-bg p-8 text-center shadow-inset-line transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent md:min-h-[360px] md:p-10",
                  isDragging
                    ? "border-brand-accent bg-brand-accent-soft shadow-glow-violet"
                    : error
                      ? "border-brand-danger/60"
                      : "border-brand-line hover:border-brand-accent/50 hover:bg-brand-elevated",
                )}
              >
                <div
                  className="dot-grid pointer-events-none absolute inset-0 opacity-30"
                  aria-hidden="true"
                />
                <div className="relative flex flex-col items-center">
                  <Upload
                    className="h-10 w-10 text-brand-subtle transition-colors group-hover:text-brand-accent"
                    aria-hidden="true"
                  />
                  <p className="mt-4 text-lg font-medium text-white">{upload.dropzoneLabel}</p>
                  <p id="upload-hint" className="mt-2 text-sm text-brand-muted">
                    {upload.dropzoneHint}
                  </p>
                </div>
              </button>
            )}

            {limitReached ? (
              <LimitReachedBanner message={error} />
            ) : error ? (
              <p id="upload-error" className="text-sm text-brand-danger" role="alert">
                {error}
              </p>
            ) : null}

            {previewUrl && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "inline-flex items-center justify-center gap-2 rounded-btn bg-cta-violet px-6 py-3 text-sm font-medium text-white shadow-cta transition-all",
                  isSubmitting
                    ? "cursor-not-allowed opacity-60"
                    : "hover:-translate-y-0.5 hover:shadow-cta-hover",
                )}
              >
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isSubmitting ? "Analyzing photo…" : "Find lookalikes"}
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
        {status === "idle" && !file && (
          <div className="hidden lg:block">
            <ResultsPlaceholder />
          </div>
        )}
      </div>
    </section>
  );
}

function StaticPreviewBanner() {
  return (
    <div
      role="note"
      className="mt-8 flex flex-col items-start gap-3 rounded-card border border-brand-accent/40 bg-brand-accent-soft p-5 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-brand-info" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-white">
            This is a static preview on GitHub Pages
          </p>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">
            Search, payment, and unlock require a backend (API, DB, webhooks) and do not work here.
            The UI below is functional, but clicking &quot;Find lookalikes&quot; will not return
            results. For a live version, deploy the app on Vercel / Railway / your own VPS — the
            Dockerfile is in the repo.
          </p>
        </div>
      </div>
      <a
        href="https://vercel.com/new"
        target="_blank"
        rel="noreferrer noopener"
        className="inline-flex shrink-0 items-center gap-2 rounded-btn border border-brand-line bg-brand-elevated px-4 py-2 text-sm font-medium text-white hover:bg-brand-surface"
      >
        Deploy to Vercel
        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
      </a>
    </div>
  );
}

/**
 * Prominent баннер о достижении rate-limit. Заменяет inline-error на
 * крупный alert-блок с иконкой — важная информация для пользователя
 * (особенно на мобильном, где маленький красный текст легко пропустить).
 */
function LimitReachedBanner({ message }: { message: string | null }) {
  return (
    <div
      id="upload-error"
      role="alert"
      className="rounded-card border border-brand-warning/40 bg-brand-warning/10 p-5 text-sm"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-brand-warning" aria-hidden="true" />
        <div>
          <p className="font-semibold text-brand-ink">Request limit reached</p>
          {message && <p className="mt-1 text-brand-muted">{message}</p>}
          <p className="mt-2 text-xs text-brand-subtle">
            Try again in a few minutes. The limit resets automatically.
          </p>
        </div>
      </div>
    </div>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-elevated p-6">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-brand-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-white">Analyzing photo…</p>
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
    <div className="mt-10 rounded-card border border-brand-line bg-brand-elevated p-6">
      <p className="text-sm font-semibold text-white">Results will appear here</p>
      <p className="mt-1 text-xs text-brand-subtle">
        Upload a photo and see the top matches right away. Premium sources arrive blurred — unlock
        them all with a single one-time payment.
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
