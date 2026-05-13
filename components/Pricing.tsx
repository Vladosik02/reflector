import { plans } from "@/lib/content";

/**
 * Тарифы: Free / Pro / Max.
 * Pro выделен (`featured`) — лёгкая тёмная подложка + бейдж «Популярный».
 * В Max акцент на «лимитированные источники, доступные 24 часа»:
 *   — это отличает наш сервис от конкурентов (см. RESEARCH.md).
 */
export default function Pricing() {
  return (
    <section id="tariffs" className="mx-auto max-w-site px-6 py-24">
      <div className="max-w-2xl">
        <span className="text-sm font-medium text-brand-accent">Тарифы</span>
        <h2 className="mt-3 text-headline text-brand-ink">Подходящий план для каждого</h2>
        <p className="mt-4 text-base text-brand-muted">
          Начните бесплатно. Перейдите на платный план, когда понадобятся уникальные базы или
          безлимит анализов.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      <p className="mt-10 text-sm text-brand-subtle">
        Подсказка: часть совпадений из уникальных источников в плане Max показывается только&nbsp;
        <span className="font-medium text-brand-warning">24 часа</span> с момента первого показа.
      </p>
    </section>
  );
}

type Plan = (typeof plans)[number];

function PlanCard({ plan }: { plan: Plan }) {
  const isFeatured = plan.featured;

  return (
    <article
      className={[
        "relative flex flex-col rounded-card border p-8 transition-colors",
        isFeatured
          ? "border-brand-ink bg-brand-ink text-white shadow-card"
          : "border-brand-line bg-brand-surface text-brand-ink",
      ].join(" ")}
    >
      {isFeatured && (
        <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-brand-success px-3 py-1 text-xs font-medium text-white">
          Популярный
        </span>
      )}

      <h3 className="text-title">{plan.name}</h3>
      <p className={["mt-2 text-sm", isFeatured ? "text-white/70" : "text-brand-muted"].join(" ")}>
        {plan.description}
      </p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className={["text-sm", isFeatured ? "text-white/60" : "text-brand-subtle"].join(" ")}>
          / {plan.period}
        </span>
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className={isFeatured ? "text-white" : "text-brand-accent"} />
            <span className={isFeatured ? "text-white/90" : "text-brand-ink"}>{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className={[
          "mt-8 w-full rounded-btn px-4 py-3 text-sm font-medium transition-colors",
          isFeatured
            ? "bg-white text-brand-ink hover:bg-white/90"
            : "bg-brand-ink text-white hover:bg-brand-accent",
        ].join(" ")}
      >
        {plan.cta}
      </button>
    </article>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={`mt-0.5 shrink-0 ${className}`}
      aria-hidden="true"
    >
      <path
        d="M4 9.5L7.5 13L14 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
