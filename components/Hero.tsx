import { hero } from "@/lib/content";

/**
 * Hero — первая секция страницы.
 * Глубина строится в 4 слоя (см. div'ы внутри section):
 *   1. Тёплый spotlight сверху.
 *   2. Два размытых orb'а (violet + warm) по углам.
 *   3. Dot-grid с радиальной маской (плотнее в центре).
 *   4. Vignette снизу.
 * Все слои pointer-events: none и aria-hidden — только декор.
 */
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="hero-spotlight pointer-events-none absolute inset-0" aria-hidden="true" />
      {/* Orb-слои уменьшены на мобильных, чтобы не съедать viewport на 375px. */}
      <div
        className="orb pointer-events-none absolute -left-24 top-10 h-48 w-48 animate-subtle-pulse rounded-full bg-orb-violet md:-left-32 md:h-72 md:w-72"
        aria-hidden="true"
      />
      <div
        className="orb pointer-events-none absolute -right-20 top-40 h-56 w-56 rounded-full bg-orb-warm opacity-70 md:-right-24 md:h-80 md:w-80"
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

      <div className="relative mx-auto max-w-site px-6 pb-20 pt-24 md:pb-28 md:pt-32">
        <span className="relative inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface/80 px-3 py-1 text-xs font-medium text-brand-muted shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(10,10,10,0.04)] backdrop-blur-sm">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-brand-accent opacity-50 motion-safe:animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-accent" />
          </span>
          {hero.badge}
        </span>

        <h1 className="mt-6 max-w-3xl text-display text-brand-ink">{hero.title}</h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">{hero.subtitle}</p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#upload"
            className="group relative rounded-btn bg-ink-cta px-5 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-btn bg-accent-cta opacity-0 transition-opacity group-hover:opacity-100"
            />
            <span className="relative z-10">{hero.primaryCta}</span>
          </a>
          <a
            href="#how"
            className="group relative rounded-btn border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-ink shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            {hero.secondaryCta}
          </a>
        </div>

        <VideoPlaceholder />
      </div>
    </section>
  );
}

/**
 * Плейсхолдер видеоурока.
 * Ambient glow за карточкой + inset-highlight по верху + 16:9 видео-плэйт.
 * TODO: заменить на реальное embed-видео.
 */
function VideoPlaceholder() {
  return (
    <div className="relative mt-16">
      <div
        aria-hidden="true"
        className="absolute -inset-x-8 -inset-y-6 -z-10 rounded-[24px] bg-orb-violet opacity-60 blur-2xl"
      />
      <div className="glass-top relative overflow-hidden rounded-card border border-brand-line bg-brand-surface shadow-glow">
        <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-brand-bg via-white to-brand-accent-soft/40">
          <div className="dot-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Воспроизвести видеоурок"
              className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-ink text-white shadow-cta transition-transform hover:scale-105"
            >
              <span
                aria-hidden="true"
                className="absolute -inset-3 rounded-full bg-brand-ink/15 opacity-0 blur-md transition-opacity group-hover:opacity-100"
              />
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="relative">
                <path d="M7 5L17 11L7 17V5Z" fill="currentColor" />
              </svg>
            </button>
            <p className="text-sm font-medium text-brand-muted">
              Видеоурок · 2 мин · как пользоваться сервисом
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
