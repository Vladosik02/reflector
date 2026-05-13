import { plans } from "@/lib/content";

/**
 * Тарифы: Free / Pro / Max.
 * Pro выделен (`featured`) — тёмная mesh-подложка, ambient violet glow позади,
 * чуть приподнятая (translate-y) на десктопе, чтобы визуально «выступал».
 * Остальные две — белые карточки с inset-highlight, поднимаются на hover.
 */
export default function Pricing() {
  return (
    <section id="tariffs" className="relative">
      {/* Decorative spotlight за featured-картой. На мобильных скейлится меньше,
          чтобы не съедать виды и не утяжелять FCP. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[260px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orb-violet opacity-50 blur-3xl md:h-[420px] md:w-[520px]"
      />

      <div className="relative mx-auto max-w-site px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">Тарифы</span>
          <h2 className="mt-3 text-headline text-brand-ink">Подходящий план для каждого</h2>
          <p className="mt-4 text-base text-brand-muted">
            Начните бесплатно. Перейдите на платный план, когда понадобятся уникальные базы или
            безлимит анализов.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-10 text-sm text-brand-subtle">
          Подсказка: часть совпадений из уникальных источников в плане Max показывается только&nbsp;
          <span className="font-medium text-brand-warning">24 часа</span> с момента первого показа.
        </p>
      </div>
    </section>
  );
}

type Plan = (typeof plans)[number];

function PlanCard({ plan }: { plan: Plan }) {
  const isFeatured = plan.featured;

  if (isFeatured) {
    return (
      <article className="group relative md:-my-3">
        {/* Ambient glow — отдельный слой за карточкой; ярче на hover. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[20px] bg-orb-violet opacity-70 blur-2xl transition-opacity duration-300 group-hover:opacity-90"
        />
        <div className="glass-top relative flex h-full flex-col overflow-hidden rounded-card border border-brand-ink bg-brand-ink bg-ink-mesh p-8 text-white shadow-ink-lift transition-transform duration-300 group-hover:-translate-y-1">
          <span className="absolute -top-3 left-8 inline-flex items-center rounded-full bg-brand-success px-3 py-1 text-xs font-medium text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_-4px_rgba(27,122,79,0.5)]">
            Популярный
          </span>

          <h3 className="text-title">{plan.name}</h3>
          <p className="mt-2 text-sm text-white/70">{plan.description}</p>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
            <span className="text-sm text-white/60">/ {plan.period}</span>
          </div>

          <ul className="mt-6 space-y-3 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <CheckIcon className="text-white" />
                <span className="text-white/90">{f}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            className="mt-8 w-full rounded-btn bg-white px-4 py-3 text-sm font-medium text-brand-ink shadow-[0_1px_0_rgba(255,255,255,0.8)_inset,0_1px_2px_rgba(10,10,10,0.12),0_8px_20px_-8px_rgba(10,10,10,0.35)] transition-all hover:-translate-y-0.5 hover:bg-white/95"
          >
            {plan.cta}
          </button>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-top relative flex flex-col rounded-card border border-brand-line bg-brand-surface p-8 text-brand-ink shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <h3 className="text-title">{plan.name}</h3>
      <p className="mt-2 text-sm text-brand-muted">{plan.description}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{plan.price}</span>
        <span className="text-sm text-brand-subtle">/ {plan.period}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className="text-brand-accent" />
            <span className="text-brand-ink">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-8 w-full rounded-btn bg-ink-cta px-4 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
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
