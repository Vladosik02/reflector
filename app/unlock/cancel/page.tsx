import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Payment cancelled",
  robots: { index: false, follow: false },
};

interface UnlockCancelPageProps {
  searchParams: Promise<{ searchId?: string }>;
}

export default async function UnlockCancelPage({ searchParams }: UnlockCancelPageProps) {
  const { searchId } = await searchParams;
  return (
    <>
      <Header />
      <main className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-4 py-16">
        <p className="text-sm font-medium text-brand-subtle">Payment cancelled</p>
        <h1 className="mt-3 text-headline text-brand-ink">No charges were made</h1>
        <p className="mt-4 max-w-md text-base text-brand-muted">
          You cancelled the payment on the provider&apos;s side. Premium matches are still available
          — you can try again at any time.
        </p>
        <Link
          href={searchId ? `/search/${searchId}` : "/"}
          className="mt-8 inline-flex items-center gap-2 rounded-btn bg-cta-violet px-5 py-3 text-sm font-medium text-white shadow-cta transition-all hover:-translate-y-0.5 hover:shadow-cta-hover"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {searchId ? "Back to results" : "Back to home"}
        </Link>
      </main>
      <Footer />
    </>
  );
}
