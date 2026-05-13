import { brandName, nav } from "@/lib/content";

/**
 * Шапка сайта.
 * Прозрачный полу-белый бэкграунд с лёгким blur — типичный приём 2026.
 * Липкая, всегда сверху.
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-line/70 bg-brand-bg/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          {/* TODO: подменить на финальный логотип */}
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-brand-ink">
            {brandName}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="#upload"
          className="rounded-btn bg-brand-ink px-4 py-2 text-sm font-medium text-white shadow-cta transition-colors hover:bg-brand-accent"
        >
          Начать
        </a>
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="8" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="14" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
