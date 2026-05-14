import { UserCircle2 } from "lucide-react";
import { hero } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Hero — две колонки на десктопе:
 *  - слева: badge, h1 (с голубым акцентом на ключевом слове), subtitle, CTA;
 *  - справа: декоративная превью результата (плейсхолдер «вы + 3 совпадения»),
 *    скрытая на мобильном — она там не помещается и мешает CTA-flow.
 * Под текстом: aurora + dot-grid + orb glow.
 */
export default function Hero({ className }: { className?: string }) {
  return (
    <section
      id="top"
      className={cn("relative overflow-hidden bg-brand-bg", className)}
    >
      <div className="aurora pointer-events-none absolute inset-0" aria-hidden="true" />
      <div
        className="orb pointer-events-none absolute -left-24 top-10 h-48 w-48 animate-subtle-pulse rounded-full bg-orb-violet md:-left-32 md:h-72 md:w-72"
        aria-hidden="true"
      />
      <div
        className="orb pointer-events-none absolute -right-20 top-40 h-56 w-56 rounded-full bg-orb-info opacity-70 md:-right-24 md:h-80 md:w-80"
        aria-hidden="true"
      />
      <div
        className="dot-grid pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
      />
      <div
        className="vignette-bottom pointer-events-none absolute inset-x-0 bottom-0 h-32"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-site grid-cols-1 items-center gap-12 px-6 pb-12 pt-12 lg:grid-cols-2 lg:gap-16 lg:pb-28 lg:pt-32">
        <div>
          <span className="relative inline-flex items-center gap-2 rounded-pill border border-brand-line bg-brand-surface/80 px-3 py-1 text-xs font-medium text-brand-muted shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_1px_2px_rgba(0,0,0,0.4)] backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-50 motion-safe:animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
            </span>
            {hero.badge}
          </span>

          <h1 className="mt-6 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-display">
            {hero.titleParts.map((part, i) => (
              <span key={i} className={part.accent ? "text-brand-info" : undefined}>
                {part.text}
              </span>
            ))}
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">{hero.subtitle}</p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#upload"
              className="group relative inline-flex items-center rounded-btn bg-cta-violet px-6 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
            >
              <span className="relative z-10">{hero.primaryCta}</span>
            </a>
            <a
              href="#how"
              className="text-sm font-medium text-brand-muted transition-colors hover:text-white"
            >
              {hero.secondaryCta} →
            </a>
          </div>
        </div>

        {/* Декоративный визуал — скрыт на мобильном. */}
        <HeroVisual />
      </div>
    </section>
  );
}

/**
 * Декоративный коллаж:
 *  - крупная карточка «вы» (портрет-плейсхолдер на фиолетово-синем градиенте);
 *  - 3 мини-карточки совпадений с %-сходства, абсолютно позиционированы.
 * Это не реальные фото — UI-демонстрация продукта.
 */
function HeroVisual() {
  return (
    <div
      className="relative hidden h-[480px] lg:block"
      aria-hidden="true"
    >
      {/* Центральная карточка «вы» */}
      <div className="absolute left-8 top-8 h-[340px] w-[260px] rotate-[-4deg] overflow-hidden rounded-3xl border border-brand-line bg-gradient-to-br from-brand-accent/40 to-brand-info/40 shadow-lift">
        <div className="absolute inset-0 flex items-end justify-center pb-8">
          <UserCircle2 className="h-40 w-40 text-white/30" />
        </div>
        <span className="absolute bottom-3 left-3 rounded-pill bg-black/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          Вы
        </span>
      </div>

      {/* Mini-карточка #1: 92% */}
      <MatchTile
        className="absolute right-4 top-2 rotate-[6deg]"
        percent={92}
        gradient="from-brand-info/50 to-brand-accent/40"
        accent="info"
      />
      {/* Mini-карточка #2: 87% */}
      <MatchTile
        className="absolute bottom-12 right-12 rotate-[-3deg]"
        percent={87}
        gradient="from-brand-accent/40 to-brand-info/30"
        accent="violet"
      />
      {/* Mini-карточка #3: 81% (locked-style — warning) */}
      <MatchTile
        className="absolute bottom-2 left-20 rotate-[4deg]"
        percent={81}
        gradient="from-brand-warning/30 to-brand-accent/30"
        accent="warning"
        locked
      />
    </div>
  );
}

interface MatchTileProps {
  className?: string;
  percent: number;
  gradient: string;
  accent: "info" | "violet" | "warning";
  locked?: boolean;
}

function MatchTile({ className, percent, gradient, accent, locked = false }: MatchTileProps) {
  const accentText = {
    info: "text-brand-info",
    violet: "text-brand-accent",
    warning: "text-brand-warning",
  }[accent];
  return (
    <div
      className={cn(
        "h-[170px] w-[140px] overflow-hidden rounded-2xl border border-brand-line bg-brand-elevated shadow-lift",
        className,
      )}
    >
      <div className={cn("relative h-[110px] bg-gradient-to-br", gradient)}>
        <div className="absolute inset-0 flex items-center justify-center">
          <UserCircle2 className={cn("h-16 w-16 text-white/35", locked && "blur-sm")} />
        </div>
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[10px] font-medium uppercase tracking-wide text-brand-subtle">
          {locked ? "Скрыто" : "Совпадение"}
        </span>
        <span className={cn("text-sm font-bold tabular-nums", accentText)}>{percent}%</span>
      </div>
    </div>
  );
}
