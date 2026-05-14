import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <UploadSection />
        <Pricing />
      </main>
      <Footer />
    </>
  );
}
