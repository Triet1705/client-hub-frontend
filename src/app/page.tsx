import { Metadata } from "next";
import { LandingNavbar } from "@/components/landing/layout/LandingNavbar";
import { HeroSection } from "@/components/landing/sections/HeroSection";
import { PainPointsSection } from "@/components/landing/sections/PainPointsSection";
import { FeaturesSection } from "@/components/landing/sections/FeaturesSection";
import { Web3TrustSection } from "@/components/landing/sections/Web3TrustSection";
import { HowItWorksSection } from "@/components/landing/sections/HowItWorksSection";
import { TechStackSection } from "@/components/landing/sections/TechStackSection";
import { EarlyAccessSection } from "@/components/landing/sections/EarlyAccessSection";
import { LandingFooter } from "@/components/landing/layout/LandingFooter";
import { MotionGuard } from "@/components/landing/effects/MotionGuard";

export const metadata: Metadata = {
  title: "Client Hub | The Platform for Modern Client Work",
  description: "A unified dashboard for agencies and freelancers to manage projects, handle billing, and collaborate with clients securely.",
};

export default function LandingPage() {
  return (
    <div className="landing-dark min-h-screen relative overflow-hidden bg-[#020617] text-slate-300 font-jakarta antialiased selection:bg-emerald-500/30">
      <LandingNavbar />
      
      <main className="relative z-10 flex flex-col w-full">
        <MotionGuard>
          <HeroSection />
          <PainPointsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <Web3TrustSection />
          <TechStackSection />
          <EarlyAccessSection />
        </MotionGuard>
      </main>
      
      <LandingFooter />
    </div>
  );
}
