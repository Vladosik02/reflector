"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { brandName, nav } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Шапка сайта.
 * Прозрачный полу-белый бэкграунд с blur, липкая.
 * При скролле добавляется тонкая тень и плотнее становится фон — даёт
 * «отделение» от контента, не нагружая визуально.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        scrolled
          ? "border-brand-line/80 bg-brand-bg/85 shadow-header backdrop-blur-xl"
          : "border-brand-line/50 bg-brand-bg/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-4 md:px-6">
        <a href="#top" className="flex items-center gap-2" aria-label={`${brandName} — на главную`}>
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-brand-ink">{brandName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Основная навигация">
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

        <div className="flex items-center gap-2">
          <a
            href="#upload"
            className="hidden rounded-btn bg-ink-cta px-4 py-2 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover md:inline-flex"
          >
            Начать
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-btn text-brand-ink hover:bg-brand-line/40 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn("border-t border-brand-line bg-brand-bg md:hidden")}
      >
        <nav
          className="mx-auto flex max-w-site flex-col gap-1 px-4 py-3"
          aria-label="Мобильная навигация"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-btn px-3 py-3 text-base font-medium text-brand-ink hover:bg-brand-line/40"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#upload"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-btn bg-brand-ink px-4 py-3 text-center text-sm font-medium text-white"
          >
            Начать
          </a>
        </nav>
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
