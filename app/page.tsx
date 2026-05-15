import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";

/**
 * Главная страница.
 *
 * Mobile-only flow (<lg): UploadSection идёт ПЕРВЫМ — пользователь сразу
 * попадает на дропзону. Hero/HowItWorks/Pricing — ниже. На десктопе (lg+):
 * Hero → HowItWorks → UploadSection → Pricing.
 *
 * Реализовано через flex `order-*` / `lg:order-*` без SSR-ветвлений и без
 * UA-sniffing — все секции рендерятся одинаково на сервере и клиенте.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main className="flex flex-col">
        <Hero className="order-2 lg:order-1" />
        <HowItWorks className="order-3 lg:order-2" />
        <UploadSection className="order-1 lg:order-3" />
        <Pricing className="order-4 lg:order-4" />
      </main>
      <Footer />
    </>
  );
}
