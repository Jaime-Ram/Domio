import type { Metadata } from "next";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import Platform from "@/components/landing/Platform";
import StackSection from "@/components/landing/StackSection";
import AgenticStatement from "@/components/landing/AgenticStatement";
import SocialProof from "@/components/landing/SocialProof";

import Pricing from "@/components/landing/Pricing";
import Faq from "@/components/landing/Faq";
import CTA from "@/components/landing/CTA";
import Footer from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "Domio | Vastgoedonderhoud dat zichzelf regelt",
  description:
    "Domio is het onderhoudssysteem voor vastgoed waarin agents het werk doen. Van melding tot factuur: automatisch triëren, de juiste vakman aansturen en alles bijhouden, terwijl jij de regie houdt.",
};

export default function V2Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <Nav />
      <main className="flex-1">
        <Hero />
        <SocialProof />
        <HowItWorks />
        <Platform />
        <AgenticStatement />
        <StackSection />
        <Pricing />
        <Faq />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
