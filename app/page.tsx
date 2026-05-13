import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";

/**
 * Главная страница — монолитный одностраничник.
 * Все секции — независимые компоненты, расположены вертикально.
 * Порядок и логика — см. PLAN.md.
 */
export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <Pricing />
        <UploadSection />
      </main>
      <Footer />
    </>
  );
}
