import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Contact",
  description: "How to reach the Reflector team.",
};

export default function ContactsPage() {
  return (
    <PageShell
      eyebrow="Contact"
      title="Get in touch"
      intro="We are a small team. We reply ourselves, usually within one business day."
    >
      <dl className="mt-4 grid gap-6 sm:grid-cols-2">
        <Item title="Support" value="hello@reflector.app" href="mailto:hello@reflector.app" />
        <Item title="Privacy" value="privacy@reflector.app" href="mailto:privacy@reflector.app" />
        <Item
          title="Partnerships"
          value="partners@reflector.app"
          href="mailto:partners@reflector.app"
        />
        <Item title="Press" value="press@reflector.app" href="mailto:press@reflector.app" />
      </dl>

      <p className="mt-10 text-sm text-brand-subtle">
        For legal matters (regulatory requests, enforcement documents), use the subject line
        &ldquo;Legal&rdquo; on any of the addresses above.
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
