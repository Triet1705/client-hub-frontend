"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";
import { CustomGraphic } from "../effects/CustomGraphics";
import { FundsReleasedIcon } from "../../icons";

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Create a Project Space",
      description: "Define the scope, set milestones, and establish payment terms in minutes.",
      graphic: <CustomGraphic type="workspace" color="emerald" size={80} />,
      gradient: "from-emerald-500/10",
    },
    {
      number: "02",
      title: "Invite the Client",
      description: "They review the terms, accept the invite, and optionally fund the escrow. No friction.",
      graphic: <CustomGraphic type="users" color="blue" size={80} />,
      gradient: "from-blue-500/10",
    },
    {
      number: "03",
      title: "Deliver & Get Paid",
      description: "Submit deliverables against milestones. Upon approval, funds are released instantly.",
      graphic: <FundsReleasedIcon className="w-20 h-20" primaryColor="#a855f7" />,
      gradient: "from-purple-500/10",
    },
  ];

  return (
    <section className="py-24 md:py-32 relative overflow-hidden bg-[#020617]">
      {/* Background connecting line */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent hidden md:block" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-3xl mx-auto mb-20 md:mb-32">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              How it <GradientText variant="blue">works.</GradientText>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl">
              From pitch to payment in three simple steps.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-12 md:gap-8 relative mt-12">
          {steps.map((step, index) => (
            <ScrollReveal key={index} delay={index * 0.2} direction="up" className="relative z-10">
              <div className="relative group">
                {/* Connecting dots for desktop */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-24 -right-4 w-8 h-px border-t-2 border-dashed border-slate-700 z-0" />
                )}
                
                <div className={`bg-gradient-to-b ${step.gradient} to-transparent p-10 rounded-3xl glass-panel border border-white/5 relative overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]`}>
                  <div className="absolute -top-10 -right-10 opacity-10 group-hover:opacity-20 transition-opacity duration-500 font-display font-black text-[150px] text-white pointer-events-none select-none">
                    {step.number}
                  </div>
                  
                  <div className="mb-8 relative z-10 flex justify-center md:justify-start">
                    <div className="relative">
                      <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-150" />
                      {step.graphic}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 relative z-10 text-center md:text-left">{step.title}</h3>
                  <p className="text-slate-400 leading-relaxed relative z-10 text-center md:text-left text-lg">
                    {step.description}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
