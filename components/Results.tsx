"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock, Lock, Sparkles, Unlock } from "lucide-react";
import { cn } from "@/lib/cn";
import type { PublicMatch } from "@/lib/face-match";
import { BlurredPreview } from "./BlurredPreview";

const SOURCE_LABELS: Record<PublicMatch["source"], string> = {
  public: "Public database",
  models: "Models",
  sports: "Athletes",
  archive: "Archive",
};

interface ResultsProps {
  searchId: string;
  /** URL пользовательского фото для side-by-side. Если null — рендерим только match-карточку. */
  userPhotoUrl: string | null;
  matches: PublicMatch[];
  unlocked: boolean;
  unlockPrice: { amountMinor: number; currency: string };
  onUnlockClick: () => void;
  isUnlocking: boolean;
}

export function Results({
  searchId: _searchId,
  userPhotoUrl,
  matches,
  unlocked,
  unlockPrice,
  onUnlockClick,
  isUnlocking,
}: ResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-brand-line bg-brand-elevated p-8 text-center">
        <p className="text-sm font-medium text-white">No matches found</p>
        <p className="mt-2 text-xs text-brand-subtle">
          Try a different photo or expand the list of sources.
        </p>
      </div>
    );
  }

  const lockedCount = matches.filter((m) => m.gated && "locked" in m && m.locked).length;
  const showUnlockCta = lockedCount > 0 && !unlocked;

  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-elevated p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-white">Matches found: {matches.length}</p>
      </div>
      <p className="mt-1 text-xs text-brand-subtle">
        Sorted by similarity score.
        {lockedCount > 0 &&
          ` Premium matches: ${lockedCount}${unlocked ? " (unlocked)." : "."}`}
      </p>

      <div role="status" aria-live="polite">
        {showUnlockCta && (
          <UnlockBanner price={unlockPrice} onClick={onUnlockClick} isUnlocking={isUnlocking} />
        )}
      </div>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list">
        {matches.map((match) => (
          <li key={match.id}>
            <MatchCard userPhotoUrl={userPhotoUrl} match={match} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function UnlockBanner({
  price,
  onClick,
  isUnlocking,
}: {
  price: { amountMinor: number; currency: string };
  onClick: () => void;
  isUnlocking: boolean;
}) {
  return (
    <div className="mt-5 flex flex-col items-start gap-3 rounded-card border border-brand-accent/40 bg-brand-surface p-5 shadow-glow-violet sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-brand-accent" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-white">Premium matches hidden</p>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">
            Unlock every premium match in this search — models, athletes, archives — for one flat
            fee. No subscription, no account.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onClick}
        disabled={isUnlocking}
        className={cn(
          "inline-flex items-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all",
          isUnlocking
            ? "cursor-not-allowed opacity-60"
            : "hover:-translate-y-0.5 hover:shadow-cta-hover",
        )}
      >
        <Unlock className="h-4 w-4" aria-hidden="true" />
        {isUnlocking ? "Unlocking..." : `Unlock for ${formatPrice(price)}`}
      </button>
    </div>
  );
}

function formatPrice(price: { amountMinor: number; currency: string }): string {
  const amount = price.amountMinor / 100;
  const symbol = price.currency.toLowerCase() === "rub" ? "₽" : price.currency.toUpperCase();
  return `${amount.toLocaleString("en-US")} ${symbol}`;
}

interface MatchCardProps {
  userPhotoUrl: string | null;
  match: PublicMatch;
}

function MatchCard({ userPhotoUrl, match }: MatchCardProps) {
  const isLocked = match.gated && "locked" in match && match.locked;
  const percent = Math.round(match.similarity * 100);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border bg-brand-surface transition-colors",
        isLocked
          ? "border-brand-warning/40 hover:border-brand-warning/60"
          : "border-brand-line hover:border-brand-accent/40",
      )}
    >
      {match.gated && !isLocked && "expiresAt" in match && match.expiresAt && (
        <LimitedBadge expiresAt={match.expiresAt} />
      )}

      <div className={cn("gap-px bg-brand-line", userPhotoUrl ? "grid grid-cols-2" : "block")}>
        {userPhotoUrl && <PhotoFrame src={userPhotoUrl} label="You" />}
        <div className="relative aspect-[3/4] bg-brand-bg">
          {isLocked && "blurhash" in match ? (
            <BlurredPreview blurhash={match.blurhash} />
          ) : (
            "imageUrl" in match && (
              <Image
                src={match.imageUrl}
                alt={`Match: ${match.name}`}
                fill
                sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
                className="object-cover"
                unoptimized={
                  match.imageUrl.startsWith("blob:") || match.imageUrl.startsWith("data:")
                }
              />
            )
          )}
          <span className="absolute bottom-1 left-1 rounded-pill bg-brand-bg/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">
            Match
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-white">{match.name}</p>
          <span
            className="text-sm font-semibold tabular-nums text-brand-accent"
            aria-label={`${percent}% similarity`}
          >
            {percent}%
          </span>
        </div>
        <p className="text-xs text-brand-subtle">
          {SOURCE_LABELS[match.source]}
          {isLocked && " · hidden"}
        </p>
        <SimilarityBar percent={percent} dimmed={isLocked} />
      </div>
    </article>
  );
}

function PhotoFrame({ src, label }: { src: string; label: string }) {
  return (
    <div className="relative aspect-[3/4] bg-brand-bg">
      <Image
        src={src}
        alt={label}
        fill
        sizes="(min-width: 1024px) 200px, (min-width: 640px) 33vw, 50vw"
        className="object-cover"
        unoptimized={src.startsWith("blob:") || src.startsWith("data:")}
      />
      <span className="absolute bottom-1 left-1 rounded-pill bg-brand-bg/80 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white backdrop-blur">
        {label}
      </span>
    </div>
  );
}

function SimilarityBar({ percent, dimmed }: { percent: number; dimmed?: boolean }) {
  return (
    <div
      className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-line"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full transition-[width] duration-500",
          dimmed ? "bg-brand-warning/60" : "bg-cta-violet",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function LimitedBadge({ expiresAt }: { expiresAt: string }) {
  const remaining = useCountdown(expiresAt);
  const expired = remaining.totalSeconds <= 0;

  return (
    <div
      className={cn(
        "absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        expired
          ? "border border-brand-line bg-brand-elevated text-brand-subtle"
          : "border border-brand-warning/30 bg-brand-warning/15 text-brand-warning",
      )}
      title={expired ? "Access has expired" : "Limited source"}
    >
      <Clock className={cn("h-3 w-3", !expired && "text-brand-warning")} aria-hidden="true" />
      {expired ? "Expired" : remaining.formatted}
    </div>
  );
}

interface Remaining {
  totalSeconds: number;
  formatted: string;
}

function useCountdown(targetIso: string): Remaining {
  const compute = (): Remaining => {
    const diffMs = new Date(targetIso).getTime() - Date.now();
    const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
    return { totalSeconds, formatted: formatHms(totalSeconds) };
  };

  const [remaining, setRemaining] = useState<Remaining>(compute);

  useEffect(() => {
    const id = setInterval(() => setRemaining(compute()), 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetIso]);

  return remaining;
}

function formatHms(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
