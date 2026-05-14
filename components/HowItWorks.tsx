import { howItWorks } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Секция «Как это работает» — три пронумерованных карточки на тёмном фоне.
 * Кружок с цифрой = фиолетовый акцент, текст шага — белый, описание — muted.
 * На мобильном — одна колонка, на десктопе — три в ряд.
 */
export default function HowItWorks({ className }: { className?: string }) {
  return (
    <section
      id="how"
      className={cn("relative border-t border-brand-line bg-brand-bg", className)}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-soft-divider"
      />
      <div className="relative mx-auto max-w-site px-6 py-12 lg:py-28">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-info">{howItWorks.eyebrow}</span>
          <h2 className="mt-3 text-headline text-white">{howItWorks.title}</h2>
          <p className="mt-4 text-base text-brand-muted">{howItWorks.subtitle}</p>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {howItWorks.steps.map((step) => (
            <li
              key={step.number}
              className="glass-top relative flex flex-col rounded-card border border-brand-line bg-brand-surface p-8 shadow-card transition-colors hover:border-brand-accent/30"
            >
              <span
                aria-hidden="true"
                className="flex h-10 w-10 items-center justify-center rounded-pill bg-brand-accent text-base font-bold text-white shadow-cta"
              >
                {step.number}
              </span>
              <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{step.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
