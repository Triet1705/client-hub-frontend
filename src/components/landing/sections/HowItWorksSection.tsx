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

          <div className="grid md:grid-cols-3 gap-8 relative mt-12">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 0.2} direction="up" className="relative z-10">
                <div className="glass-panel glass-panel-hover p-8 rounded-2xl h-full flex flex-col items-start relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 font-display font-black text-8xl text-white group-hover:opacity-20 transition-opacity pointer-events-none select-none">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed relative z-10">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
      </div>
    </section>
  );
}
