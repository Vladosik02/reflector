import Header from "@/components/Header";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Pricing from "@/components/Pricing";
import UploadSection from "@/components/UploadSection";
import Trust from "@/components/Trust";
import FAQ from "@/components/FAQ";
import Footer from "@/components/Footer";

/**
 * Главная страница — монолитный одностраничник.
 * Порядок секций: интро → объяснение → социальное доказательство (тарифы) →
 * функциональный блок → privacy-доверие → FAQ → footer.
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
        <Trust />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}
