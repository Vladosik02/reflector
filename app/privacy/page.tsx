import type { Metadata } from "next";
import PageShell from "@/components/PageShell";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Reflector handles photos and personal data of its users.",
};

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Legal"
      title="Privacy Policy"
      intro="This document describes what data we collect, how we store it, and who we share it with. Not legal advice — published for transparency."
    >
      <p className="text-brand-muted">Effective from May 13, 2026. Last revision: May 13, 2026.</p>

      <h2 className="mt-10 text-title text-brand-ink">1. What data we collect</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6 text-brand-muted">
        <li>
          <strong className="text-brand-ink">Face photos</strong> you upload to search for
          lookalikes. This is biometric data.
        </li>
        <li>
          <strong className="text-brand-ink">Technical data</strong>: IP address, browser type,
          request time — used to prevent abuse and for basic analytics.
        </li>
        <li>
          <strong className="text-brand-ink">Email and payment details</strong> — only if you
          purchase a paid plan. Payments go through a certified provider; we do not store card
          numbers.
        </li>
      </ul>

      <h2 className="mt-10 text-title text-brand-ink">2. Why we use it</h2>
      <p className="mt-3 text-brand-muted">
        Photos — only for a single search request, in the moment. Technical data — to protect
        against automated attacks and to improve the service. Email — for plan notifications and
        support.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">3. How long we keep it</h2>
      <p className="mt-3 text-brand-muted">
        Photos are automatically wiped from storage 24 hours after upload — by a background job,
        with no possibility of recovery. Account data — while the account is active, plus 30 days
        after deletion (to resolve any potential disputes).
      </p>

      <h2 className="mt-10 text-title text-brand-ink">4. Biometrics</h2>
      <p className="mt-3 text-brand-muted">
        Before uploading a photo, you give explicit consent to biometric processing — via a
        dedicated checkbox. Consent can be withdrawn at any time by emailing{" "}
        <a className="underline" href="mailto:privacy@reflector.app">
          privacy@reflector.app
        </a>
        . Withdrawal means deletion of all related data within 7 days.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">5. Who we share data with</h2>
      <p className="mt-3 text-brand-muted">
        No one. We do not sell data, do not pass it to ad networks, and do not exchange it with
        aggregators. Access to photos is limited to our automated processes; no employee reviews
        photos manually.
      </p>

      <h2 className="mt-10 text-title text-brand-ink">6. Your rights</h2>
      <p className="mt-3 text-brand-muted">
        You have the right to request a copy of your data, correction, deletion, or restriction of
        processing. Requests are handled within 30 days, in line with applicable data protection
        regulations (including GDPR where it applies).
      </p>

      <h2 className="mt-10 text-title text-brand-ink">7. Contact</h2>
      <p className="mt-3 text-brand-muted">
        Privacy questions —{" "}
        <a className="underline" href="mailto:privacy@reflector.app">
          privacy@reflector.app
        </a>
        . Operator details for regulatory inquiries will be published when the service enters
        commercial operation.
      </p>
    </PageShell>
  );
}
