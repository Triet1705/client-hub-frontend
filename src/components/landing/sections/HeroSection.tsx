"use client";

import { GradientText } from "../effects/GradientText";
import { DashboardMockup } from "../effects/DashboardMockup";
import { ScrollReveal } from "../effects/ScrollReveal";
import { ColorBendsBg } from "../effects/ColorBendsBg";
import { CurvedLoopText } from "../effects/CurvedLoopText";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 w-full overflow-hidden">
      <ColorBendsBg />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-4xl mx-auto flex flex-col items-center z-10 relative">
        <ScrollReveal delay={0.1}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700 mb-8 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow"></span>
            <span className="text-xs font-medium text-slate-300">Client Hub Beta 1.0 is live</span>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-white mb-6">
            The platform for <br className="hidden md:block" />
            <GradientText>modern client work.</GradientText>
          </h1>
        </ScrollReveal>

        <ScrollReveal delay={0.3}>
          <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            A unified dashboard for agencies and freelancers to manage projects, handle billing, and collaborate with clients securely. No chaos, just clarity.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.4}>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="#early-access" 
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors duration-200 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#020617] w-full sm:w-auto cursor-pointer"
            >
              Get Early Access
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link 
              href="#features" 
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-slate-800 text-slate-200 font-medium border border-slate-700 hover:bg-slate-700 transition-colors duration-200 w-full sm:w-auto cursor-pointer"
            >
              Explore Features
            </Link>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.5}>
          <div className="mt-12 w-full max-w-3xl mx-auto opacity-100">
            <CurvedLoopText text="SECURE ESCROW * VERIFIED TENANT * AUDIT TRAIL *" duration={25} />
          </div>
        </ScrollReveal>
      </div>

      {/* Dashboard Preview */}
      <DashboardMockup />
      </div>
    </section>
  );
}
