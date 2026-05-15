import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageShellProps {
  title: string;
  eyebrow?: string;
  intro?: string;
  children: ReactNode;
}

/**
 * Обёртка для второстепенных страниц (privacy, terms, about и т.п.):
 * Header + центрированный заголовок + контент + Footer.
 */
export default function PageShell({ title, eyebrow, intro, children }: PageShellProps) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-20">
        <header>
          {eyebrow && <span className="text-sm font-medium text-brand-info">{eyebrow}</span>}
          <h1 className="mt-3 text-headline text-white">{title}</h1>
          {intro && <p className="mt-4 text-base text-brand-muted">{intro}</p>}
        </header>
        <article className="prose prose-invert mt-10 max-w-none">{children}</article>
      </main>
      <Footer />
    </>
  );
}
