import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { env } from "@/lib/env";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const siteUrl = env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Reflector — find your lookalike by photo",
    template: "%s · Reflector",
  },
  description:
    "Upload a single photo and discover who, out of millions of people, you look like the most. Unique databases, limited matches, photos deleted after 24 hours.",
  applicationName: "Reflector",
  keywords: [
    "lookalike search",
    "face recognition",
    "doppelganger",
    "find similar face",
    "AI",
    "Reflector",
  ],
  authors: [{ name: "Reflector" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Reflector",
    title: "Reflector — find your lookalike by photo",
    description:
      "Upload a single photo and discover who, out of millions of people, you look like the most. Photos deleted after 24 hours.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflector — find your lookalike by photo",
    description:
      "Upload a single photo and discover who, out of millions of people, you look like the most.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1124",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: "Reflector",
        url: siteUrl,
        logo: `${siteUrl}/favicon.svg`,
      },
      {
        "@type": "WebSite",
        name: "Reflector",
        url: siteUrl,
        inLanguage: "en",
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-brand-bg font-sans text-brand-ink antialiased">
        {children}
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
