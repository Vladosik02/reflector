import { brandName, footerLinks } from "@/lib/content";

/**
 * Подвал — мини-карта сайта + privacy-первый месседж.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-line bg-brand-bg">
      <div className="mx-auto max-w-site px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-brand-ink">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm text-brand-muted">
              Сервис поиска двойников на основе нейросетевого анализа лица. Фото удаляются
              автоматически через 24 часа и не используются для обучения моделей.
            </p>
          </div>

          <FooterColumn title="Продукт" links={footerLinks.product} />
          <FooterColumn title="Компания" links={footerLinks.company} />
          <FooterColumn title="Правовое" links={footerLinks.legal} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-brand-line pt-6 text-xs text-brand-subtle md:flex-row md:items-center">
          <span>
            © {year} {brandName}. Все права защищены.
          </span>
          <span>Сделано с заботой о приватности.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-subtle">{title}</p>
      <ul className="mt-4 space-y-2">
        {links.map((l) => (
          <li key={l.href}>
            <a
              href={l.href}
              className="text-sm text-brand-muted transition-colors hover:text-brand-ink"
            >
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
