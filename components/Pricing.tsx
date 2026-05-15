import { plans } from "@/lib/content";
import { cn } from "@/lib/cn";

/**
 * Тарифы: Free / Pro / Max.
 * Pro выделен (`featured`) — surface-mesh подложка с фиолетово-синим градиентом,
 * ambient violet glow позади, белая CTA с тёмным текстом.
 * Остальные две — surface-карточки, фиолетовая CTA-кнопка.
 *
 * На мобильном Pro идёт первым (конверсия), на десктопе — в центре в естественном порядке.
 */
export default function Pricing({ className }: { className?: string }) {
  return (
    <section
      id="tariffs"
      className={cn("relative border-t border-brand-line bg-brand-bg", className)}
    >
      {/* Decorative spotlight за featured-картой. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-[260px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-orb-violet opacity-50 blur-3xl md:h-[420px] md:w-[520px]"
      />

      <div className="relative mx-auto max-w-site px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-info">Pricing</span>
          <h2 className="mt-3 text-headline text-white">A plan for everyone</h2>
          <p className="mt-4 text-base text-brand-muted">
            Start for free. Upgrade to a paid plan when you need unique databases or unlimited
            searches.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3 md:items-stretch">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <p className="mt-10 text-sm text-brand-subtle">
          Note: some matches from unique sources in the Max plan are only visible for&nbsp;
          <span className="font-medium text-brand-warning">24 hours</span> from the moment they are
          first shown.
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
      // Featured Pro: на мобильном идёт первым (`order-first`), на десктопе —
      // в естественном порядке (`md:order-none`). `overflow-hidden` НЕ на
      // внешнем `<div>` карточки — иначе бейдж `-top-3` клипится. Mesh-фон
      // вынесен в отдельный inner `<div>` со своим overflow-hidden.
      <article className="group relative order-first md:-my-3 md:order-none">
        {/* Ambient violet glow — отдельный слой за карточкой. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-3 rounded-[28px] bg-orb-violet opacity-80 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        />
        <div className="glass-top relative flex h-full flex-col rounded-card border border-brand-accent/40 bg-brand-elevated p-8 text-white shadow-glow-violet transition-transform duration-300 group-hover:-translate-y-1">
          {/* Mesh-фон — отдельный clipping-слой, чтобы бейдж сверху не обрезался. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-card bg-surface-mesh"
          />

          <span className="absolute -top-3 left-8 z-10 inline-flex items-center rounded-pill bg-brand-success px-3 py-1 text-xs font-semibold text-white shadow-[0_1px_0_rgba(255,255,255,0.2)_inset,0_4px_12px_-4px_rgba(34,197,94,0.5)]">
            Popular
          </span>

          <div className="relative flex h-full flex-col">
            <h3 className="text-title">{plan.name}</h3>
            <p className="mt-2 text-sm text-brand-muted">{plan.description}</p>

            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
              <span className="text-sm text-brand-subtle">/ {plan.period}</span>
            </div>

            <ul className="mt-6 space-y-3 text-sm">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckIcon className="text-brand-accent" />
                  <span className="text-white/90">{f}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="mt-8 w-full rounded-btn bg-white px-4 py-3 text-sm font-semibold text-brand-bg shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_24px_-8px_rgba(255,255,255,0.25)] transition-all hover:-translate-y-0.5 hover:bg-white/95"
            >
              {plan.cta}
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="glass-top relative flex flex-col rounded-card border border-brand-line bg-brand-surface p-8 text-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-lift">
      <h3 className="text-title">{plan.name}</h3>
      <p className="mt-2 text-sm text-brand-muted">{plan.description}</p>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-bold tracking-tight text-white">{plan.price}</span>
        <span className="text-sm text-brand-subtle">/ {plan.period}</span>
      </div>

      <ul className="mt-6 space-y-3 text-sm">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <CheckIcon className="text-brand-success" />
            <span className="text-white/90">{f}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="mt-8 w-full rounded-btn bg-cta-violet px-4 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
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
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
