import Link from "next/link";
import { brandName, footerLinks } from "@/lib/content";

/**
 * Подвал — мини-карта сайта + privacy-первый месседж.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-brand-line bg-brand-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-soft-divider"
      />
      <div className="relative mx-auto max-w-site px-6 py-16">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="text-sm font-semibold text-white">{brandName}</p>
            <p className="mt-3 max-w-xs text-sm text-brand-muted">
              A lookalike search service powered by neural-network face analysis. Photos are deleted
              automatically after 24 hours and are never used to train models.
            </p>
          </div>

          <FooterColumn title="Product" links={footerLinks.product} />
          <FooterColumn title="Company" links={footerLinks.company} />
          <FooterColumn title="Legal" links={footerLinks.legal} />
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-brand-line pt-6 text-xs text-brand-subtle md:flex-row md:items-center">
          <span>
            © {year} {brandName}. All rights reserved.
          </span>
          <span>Built with privacy in mind.</span>
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
        {links.map((l) => {
          const isInternal = l.href.startsWith("/");
          const className = "text-sm text-brand-muted transition-colors hover:text-white";
          return (
            <li key={l.href}>
              {isInternal ? (
                <Link href={l.href} className={className}>
                  {l.label}
                </Link>
              ) : (
                <a href={l.href} className={className}>
                  {l.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
