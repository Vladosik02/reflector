"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { brandName, nav } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Шапка сайта.
 * Sticky, тёмный полупрозрачный фон + blur. При скролле плотнее.
 * Лого — 2 пересекающихся круга в brand.info (голубой) — наш аналог
 * «голубого сердца» у nakrutochka, но собственный знак.
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
          ? "border-brand-line bg-brand-bg/85 shadow-header backdrop-blur-xl"
          : "border-transparent bg-brand-bg/60 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-16 max-w-site items-center justify-between px-4 md:px-6">
        <a
          href="#top"
          className="flex items-center gap-2 text-brand-info"
          aria-label={`${brandName} — home`}
        >
          <Logo />
          <span className="text-sm font-semibold tracking-tight text-white">{brandName}</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm text-brand-muted transition-colors hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#upload"
            className="hidden rounded-btn bg-cta-violet px-4 py-2 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover md:inline-flex"
          >
            Get started
          </a>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-btn text-white hover:bg-brand-elevated md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className={cn("border-t border-brand-line bg-brand-surface md:hidden")}
      >
        <nav
          className="mx-auto flex max-w-site flex-col gap-1 px-4 py-3"
          aria-label="Mobile navigation"
        >
          {nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-btn px-3 py-3 text-base font-medium text-white hover:bg-brand-elevated"
            >
              {item.label}
            </a>
          ))}
          <a
            href="#upload"
            onClick={() => setOpen(false)}
            className="mt-2 rounded-btn bg-cta-violet px-4 py-3 text-center text-sm font-medium text-white shadow-cta"
          >
            Get started
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
