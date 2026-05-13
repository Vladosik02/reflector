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
    default: "Reflector — найди своего двойника по фото",
    template: "%s · Reflector",
  },
  description:
    "Загрузите одно фото и узнайте, на кого из миллионов людей вы похожи. Уникальные базы, лимитированные совпадения, удаление фото через 24 часа.",
  applicationName: "Reflector",
  keywords: [
    "поиск двойников",
    "распознавание лиц",
    "doppelganger",
    "найти похожего",
    "AI",
    "Reflector",
  ],
  authors: [{ name: "Reflector" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: siteUrl,
    siteName: "Reflector",
    title: "Reflector — найди своего двойника по фото",
    description:
      "Загрузите одно фото и узнайте, на кого из миллионов людей вы похожи. Удаление через 24 часа.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reflector — найди своего двойника по фото",
    description: "Загрузите одно фото и узнайте, на кого из миллионов людей вы похожи.",
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
  themeColor: "#FAFAF7",
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
        inLanguage: "ru-RU",
      },
    ],
  };

  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased">
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
