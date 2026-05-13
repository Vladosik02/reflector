import { howItWorks } from "@/lib/content";

/**
 * Три шага: «Загрузка → Анализ → Результат».
 * Карточки на белом с inset-highlight'ом и hover-lift'ом.
 * Цифра-шаг вынесена в круглый чип с собственной мини-тенью — это даёт
 * вторую плоскость глубины внутри карточки.
 */
export default function HowItWorks() {
  return (
    <section id="how" className="relative border-y border-brand-line bg-brand-surface">
      <div
        className="subtle-grid pointer-events-none absolute inset-0 opacity-50"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-site px-6 py-24">
        <div className="max-w-2xl">
          <span className="text-sm font-medium text-brand-accent">Как это работает</span>
          <h2 className="mt-3 text-headline text-brand-ink">Три шага до результата</h2>
          <p className="mt-4 text-base text-brand-muted">
            Сервис устроен максимально просто. Никаких регистраций для базового поиска — загрузили,
            получили ответ.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item, idx) => (
            <article
              key={item.step}
              className="glass-top relative flex flex-col rounded-card border border-brand-line bg-brand-bg p-8 shadow-card transition-all duration-300 hover:-translate-y-1 hover:bg-brand-surface hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-brand-line bg-brand-surface font-mono text-sm font-semibold text-brand-ink shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_1px_2px_rgba(10,10,10,0.04)]">
                  {item.step}
                </span>
                {idx < howItWorks.length - 1 && (
                  <span aria-hidden="true" className="hidden h-px w-12 bg-soft-divider md:block" />
                )}
              </div>
              <h3 className="mt-6 text-title text-brand-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-brand-muted">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
