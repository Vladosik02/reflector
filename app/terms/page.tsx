import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of service for Reflector — photo-based lookalike search.",
};

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Terms of Service"
      intro="An agreement between you and the service. Using Reflector means you accept this document."
    >
      <p className="text-brand-muted">Effective from May 13, 2026.</p>

      <h2 className="mt-10 text-title text-brand-ink">1. What Reflector is</h2>
      <p className="mt-3 text-brand-muted">
        Reflector is an online service that compares your uploaded photo with a database of faces
        and returns the most similar matches. The service is for entertainment and informational
        purposes; it is not intended for identification in legally significant contexts.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">2. What you agree to</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Upload only photos of faces you have the right to use.</li>
        <li>Do not use the service to stalk, dox, or harass other people.</li>
        <li>Do not bypass rate limits, brute-force the API, or impersonate clients.</li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">3. What we agree to</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Aim for 99.5% monthly availability (no SLA on the free plan).</li>
        <li>Delete uploaded photos within 24 hours.</li>
        <li>Never use your photos to train models — neither ours nor anyone else&apos;s.</li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">4. Limitation of liability</h2>
      <p className="mt-3 text-brand-muted">
        Results are probabilistic. An 85% similarity is not proof of kinship or identity. We are not
        liable for decisions made based on the results of the service.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">5. Changes</h2>
      <p className="mt-3 text-brand-muted">
        We may update these terms with 14 days&apos; notice (via email for registered users and a
        banner on the site for everyone else).
      </p>
    </PageShell>
  );
}
