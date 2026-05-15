import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "About",
  description: "The team and the mission behind Reflector.",
};

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About us"
      title="Lookalike search as a ritual, not surveillance"
      intro="Reflector is a small project about how we all fit into the larger picture of human faces."
    >
      <p className="mt-2 text-brand-muted">
        The idea is simple: eight billion people live on this planet. Some of them are bound to look
        like you — in features, in lines, in expression. Finding that person is a fun experiment, a
        chance to see yourself from the outside.
      </p>

      <p className="mt-4 text-brand-muted">
        We do it carefully: we do not sell your data, we do not show ads on top of results, and we
        do not train models on uploaded photos. Just the tool — and a clean window after it.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">Principles</h2>
      <ul className="mt-4 list-disc space-y-2 pl-6 text-brand-muted">
        <li>Privacy by default: photos are deleted after 24 hours, no exceptions.</li>
        <li>No dark patterns: explicit consent, transparent pricing, no hidden charges.</li>
        <li>Accuracy over volume: ten plausible matches beat a hundred random ones.</li>
      </ul>
    </PageShell>
  );
}
