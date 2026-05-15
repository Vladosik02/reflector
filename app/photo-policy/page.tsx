import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Photo Policy",
  description: "Technical details about how uploaded photos are processed and stored in Reflector.",
};

export default function PhotoPolicyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Photo Policy"
      intro="Technical details — what happens to a photo from the moment it is uploaded until it is deleted."
    >
      <h2 className="mt-2 text-title text-brand-ink">Lifecycle of an uploaded photo</h2>
      <ol className="mt-4 list-decimal space-y-3 pl-6 text-brand-muted">
        <li>
          <strong className="text-brand-ink">Transfer.</strong> The photo is uploaded over HTTPS
          (TLS 1.3). The server does not write the request body to logs.
        </li>
        <li>
          <strong className="text-brand-ink">Feature extraction.</strong> A numeric face embedding
          is computed from the photo — a short vector that the model uses to find similar faces. The
          embedding alone cannot be used to reconstruct the original photo.
        </li>
        <li>
          <strong className="text-brand-ink">Storage.</strong> The photo is encrypted (AES-256-GCM)
          and saved to object storage with TTL=24h. The encryption key stays on the service side.
        </li>
        <li>
          <strong className="text-brand-ink">Comparison.</strong> The embedding is compared against
          the databases you selected in the filters. The top matches are returned with a similarity
          score.
        </li>
        <li>
          <strong className="text-brand-ink">Deletion.</strong> After 24 hours, a background job
          deletes the file from storage and wipes related database records (soft delete → physical
          delete after 7 days).
        </li>
      </ol>

      <h2 className="mt-10 text-title text-brand-ink">What we do NOT do</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>We do not use your photos to train models.</li>
        <li>We do not share photos or embeddings with third parties.</li>
        <li>We do not analyse photos for emotion, age, or gender — only geometric comparison.</li>
        <li>We do not retain photos after TTL expiry in any backup.</li>
      </ul>
    </PageShell>
  );
}
