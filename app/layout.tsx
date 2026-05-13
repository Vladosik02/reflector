import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Премиальный sans-serif с расширенным набором весов.
// Используется через CSS-переменную --font-inter (см. tailwind.config.ts).
const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Doppelganger — Найди своего двойника",
  description:
    "Загрузите фото и узнайте, на кого из миллионов людей вы похожи. Уникальные источники, лимитированные совпадения, премиальная аккуратность.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
