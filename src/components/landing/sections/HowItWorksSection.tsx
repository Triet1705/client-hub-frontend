"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create a Project Space",
      description: "Define the scope, set milestones, and establish payment terms in minutes.",
    },
    {
      number: "02",
      title: "Invite the Client",
      description: "They review the terms, accept the invite, and optionally fund the escrow. No friction.",
    },
    {
      number: "03",
      title: "Deliver & Get Paid",
      description: "Submit deliverables against milestones. Upon approval, funds are released instantly.",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              How it <GradientText>works.</GradientText>
            </h2>
            <p className="text-slate-400 text-lg">
              From pitch to payment in three simple steps.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-slate-700 to-transparent z-0" />

          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.2} direction="up" className="relative z-10 text-center">
              <div className="w-24 h-24 mx-auto bg-[#020617] rounded-full border border-slate-700 flex items-center justify-center mb-6 shadow-xl relative group">
                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-emerald-500/50 transition-colors" />
                <span className="text-3xl font-display font-bold text-slate-300 group-hover:text-white transition-colors">{step.number}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
              <p className="text-slate-400 leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
