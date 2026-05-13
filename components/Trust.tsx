import { Lock, ShieldCheck, Sparkles, Trash2 } from "lucide-react";
import { trust } from "@/lib/content";

const ICONS = [Trash2, Sparkles, Lock, ShieldCheck] as const;

/**
 * Trust-секция — privacy-first сигналы. Размещается перед FAQ,
 * чтобы снять барьер «загружать ли мне сюда фото» перед выбором тарифа.
 */
export default function Trust() {
  return (
    <section id="trust" className="border-t border-brand-line bg-brand-bg">
      <div className="mx-auto max-w-site px-6 py-16 md:py-24">
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
                className="flex gap-4 rounded-card border border-brand-line bg-brand-surface p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-btn bg-brand-bg text-brand-accent">
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
