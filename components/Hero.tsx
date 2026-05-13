import { hero } from "@/lib/content";

/**
 * Hero — первая секция страницы.
 * Содержит:
 *   1. Бейдж-метку («AI · 2026»).
 *   2. Крупный заголовок H1.
 *   3. Подзаголовок.
 *   4. Две CTA-кнопки.
 *   5. Видео-плейсхолдер 16:9 — место для встроенного видеоурока.
 *
 * TODO (для следующего этапа):
 *   - Подменить VideoPlaceholder на YouTube embed / MUX / собственный плеер.
 *   - Добавить kinetic-typography анимацию заголовка (вариант для дизайнера).
 */
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <div className="dot-grid absolute inset-0 opacity-60" aria-hidden="true" />

      <div className="relative mx-auto max-w-site px-6 pt-24 pb-20 md:pt-32 md:pb-28">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-line bg-brand-surface px-3 py-1 text-xs font-medium text-brand-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-accent" />
          {hero.badge}
        </span>

        <h1 className="mt-6 max-w-3xl text-display text-brand-ink">
          {hero.title}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-brand-muted">
          {hero.subtitle}
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="#upload"
            className="rounded-btn bg-brand-ink px-5 py-3 text-sm font-medium text-white shadow-cta transition-colors hover:bg-brand-accent"
          >
            {hero.primaryCta}
          </a>
          <a
            href="#how"
            className="rounded-btn border border-brand-line bg-brand-surface px-5 py-3 text-sm font-medium text-brand-ink transition-colors hover:bg-white"
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
 * Соотношение 16:9, тонкая граница, иконка play.
 * TODO: заменить на реальное embed-видео.
 */
function VideoPlaceholder() {
  return (
    <div className="mt-16 overflow-hidden rounded-card border border-brand-line bg-brand-surface shadow-card">
      <div className="relative aspect-[16/9] w-full bg-gradient-to-br from-brand-bg to-white">
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <button
            type="button"
            aria-label="Воспроизвести видеоурок"
            className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-ink text-white shadow-cta transition-transform hover:scale-105"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <path d="M7 5L17 11L7 17V5Z" fill="currentColor" />
            </svg>
          </button>
          <p className="text-sm font-medium text-brand-muted">
            Видеоурок · 2 мин · как пользоваться сервисом
          </p>
        </div>
      </div>
    </div>
  );
}
