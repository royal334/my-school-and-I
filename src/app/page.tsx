import { Navbar } from "@/components/homepage/navbar";
import { HeroSection } from "@/components/homepage/hero-section";
import { FeaturesSection } from "@/components/homepage/features-section";
import { HowItWorksSection } from "@/components/homepage/how-it-works-section";
import { PricingSection } from "@/components/homepage/pricing-section";
import { SocialProofSection } from "@/components/homepage/social-proof-section";
import { CTASection } from "@/components/homepage/cta-section";
import { Footer } from "@/components/homepage/footer";

export default function LandingPage() {
  return (
    <>
      {/* <a
        href="main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-white"
        style={{ background: "#2563eb" }}
      >
        Skip to content
      </a> */}
      <Navbar />
      <main id="main">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
