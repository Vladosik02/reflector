"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Clock, Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";
import type { Match } from "@/lib/face-match";

const SOURCE_LABELS: Record<Match["source"], string> = {
  public: "Публичная база",
  models: "Модели",
  sports: "Спортсмены",
  archive: "Архив",
};

interface ResultsProps {
  userPhotoUrl: string;
  matches: Match[];
}

export function Results({ userPhotoUrl, matches }: ResultsProps) {
  if (matches.length === 0) {
    return (
      <div className="mt-10 rounded-card border border-brand-line bg-brand-bg p-8 text-center">
        <p className="text-sm font-medium text-brand-ink">Совпадений не найдено</p>
        <p className="mt-2 text-xs text-brand-subtle">
          Попробуйте другое фото или расширьте список источников.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-10 rounded-card border border-brand-line bg-brand-bg p-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-brand-accent" aria-hidden="true" />
        <p className="text-sm font-semibold text-brand-ink">Найдено совпадений: {matches.length}</p>
      </div>
      <p className="mt-1 text-xs text-brand-subtle">
        Отсортировано по проценту сходства. Совпадения из уникальных источников помечены янтарным.
      </p>

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

interface MatchCardProps {
  userPhotoUrl: string;
  match: Match;
}

function MatchCard({ userPhotoUrl, match }: MatchCardProps) {
  const isLimited = Boolean(match.expiresAt);
  const percent = Math.round(match.similarity * 100);

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-card border bg-brand-surface transition-colors",
        isLimited ? "border-brand-warning/60" : "border-brand-line hover:border-brand-ink/30",
      )}
    >
      {isLimited && match.expiresAt && <LimitedBadge expiresAt={match.expiresAt} />}

      <div className="grid grid-cols-2 gap-px bg-brand-line">
        <PhotoFrame src={userPhotoUrl} label="Вы" />
        <PhotoFrame src={match.imageUrl} label="Совпадение" />
      </div>

      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-semibold text-brand-ink">{match.name}</p>
          <span
            className="text-sm font-semibold tabular-nums text-brand-accent"
            aria-label={`Сходство ${percent} процентов`}
          >
            {percent}%
          </span>
        </div>
        <p className="text-xs text-brand-subtle">{SOURCE_LABELS[match.source]}</p>
        <SimilarityBar percent={percent} />
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
      <span className="absolute bottom-1 left-1 rounded-full bg-brand-ink/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
        {label}
      </span>
    </div>
  );
}

function SimilarityBar({ percent }: { percent: number }) {
  return (
    <div
      className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-brand-line"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-brand-accent transition-[width] duration-500"
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
        "absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
        expired ? "bg-brand-line text-brand-subtle" : "bg-brand-warning/15 text-brand-warning",
      )}
      title={expired ? "Срок доступа истёк" : "Лимитированный источник"}
    >
      <Clock className="h-3 w-3" aria-hidden="true" />
      {expired ? "Срок истёк" : remaining.formatted}
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
