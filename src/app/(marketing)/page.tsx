import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/marketing/HeroSection";
import FeaturesSection from "@/components/marketing/FeaturesSection";
import HowItWorksSection from "@/components/marketing/HowItWorksSection";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "SmartLease AI — Understand Your Lease. Protect Your Rights.",
  description:
    "AI-powered lease analysis. Upload your rental agreement and get instant clause analysis, fair rent estimates, and negotiation scripts.",
};

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </main>
  );
}
