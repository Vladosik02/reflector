import { howItWorks } from "@/lib/content";

/**
 * Три шага: «Загрузка → Анализ → Результат».
 * Карточки на белом фоне с тонкой границей — приём Stripe.
 */
export default function HowItWorks() {
  return (
    <section id="how" className="border-y border-brand-line bg-brand-surface">
      <div className="mx-auto max-w-site px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">
            Как это работает
          </span>
          <h2 className="mt-3 text-headline text-brand-ink">
            Три шага до результата
          </h2>
          <p className="mt-4 text-base text-brand-muted">
            Сервис устроен максимально просто. Никаких регистраций для базового
            поиска — загрузили, получили ответ.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <article
              key={item.step}
              className="rounded-card border border-brand-line bg-brand-bg p-8"
            >
              <span className="font-mono text-sm text-brand-subtle">
                {item.step}
              </span>
              <h3 className="mt-6 text-title text-brand-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
