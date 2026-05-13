import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Контакты",
  description: "Как связаться с командой Reflector.",
};

export default function ContactsPage() {
  return (
    <PageShell
      eyebrow="Контакты"
      title="Напишите нам"
      intro="Мы маленькая команда, отвечаем сами и обычно в течение одного рабочего дня."
    >
      <dl className="mt-4 grid gap-6 sm:grid-cols-2">
        <Item title="Поддержка" value="hello@reflector.app" href="mailto:hello@reflector.app" />
        <Item
          title="Приватность"
          value="privacy@reflector.app"
          href="mailto:privacy@reflector.app"
        />
        <Item
          title="Партнёрство"
          value="partners@reflector.app"
          href="mailto:partners@reflector.app"
        />
        <Item title="Пресса" value="press@reflector.app" href="mailto:press@reflector.app" />
      </dl>

      <p className="mt-10 text-sm text-brand-subtle">
        Для юридически значимых обращений (запросы регуляторов, исполнительные документы) — пишите с
        темой «Юридическое» на любой адрес выше.
      </p>
    </PageShell>
  );
}

function Item({ title, value, href }: { title: string; value: string; href: string }) {
  return (
    <div className="rounded-card border border-brand-line bg-brand-surface p-5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-brand-subtle">{title}</dt>
      <dd className="mt-2">
        <a
          className="text-base text-brand-ink underline-offset-2 hover:text-brand-accent hover:underline"
          href={href}
        >
          {value}
        </a>
      </dd>
    </div>
  );
}
