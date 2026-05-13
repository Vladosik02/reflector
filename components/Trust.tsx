import { Lock, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { trust } from "@/lib/content";

const ICONS = [Trash2, Sparkles, Lock, ShieldCheck] as const;

/**
 * Trust-секция — privacy-first сигналы.
 * Карточки получают subtle hover-lift, чип иконки — отдельную мини-тень,
 * чтобы создать вторую плоскость глубины.
 */
export default function Trust() {
  return (
    <section id="trust" className="relative border-t border-brand-line bg-brand-bg">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-soft-divider"
      />

      <div className="relative mx-auto max-w-site px-6 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">{trust.eyebrow}</span>
          <h2 className="mt-3 text-headline text-brand-ink">{trust.title}</h2>
          <p className="mt-4 text-base text-brand-muted">{trust.description}</p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {trust.pillars.map((p, idx) => {
            const Icon = ICONS[idx] ?? ShieldCheck;
            return (
              <article
                key={p.title}
                className="glass-top relative flex gap-4 rounded-card border border-brand-line bg-brand-surface p-6 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-brand-accent-soft text-brand-accent shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(91,91,214,0.18)]">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-brand-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">{p.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
