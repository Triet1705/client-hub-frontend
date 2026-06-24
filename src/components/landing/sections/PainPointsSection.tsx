"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { CustomGraphic } from "../effects/CustomGraphics";

export function PainPointsSection() {
  const painPoints = [
    {
      icon: <CustomGraphic type="chat" color="rose" size={64} />,
      title: "Scattered Communication",
      description: "Emails, Slack, WhatsApp. Finding that one important file or approval message becomes a scavenger hunt.",
      accent: "group-hover:border-rose-500/30",
    },
    {
      icon: <CustomGraphic type="lock" color="amber" size={64} />,
      title: "Chasing Payments",
      description: "Awkward follow-ups for late invoices. Doing the work on time but waiting 30+ days to see the money.",
      accent: "group-hover:border-amber-500/30",
    },
    {
      icon: <CustomGraphic type="alert" color="orange" size={64} />,
      title: "Scope Creep & Disputes",
      description: "\"Can you just add this one thing?\" Without a clear, agreed-upon record, expectations misalign.",
      accent: "group-hover:border-orange-500/30",
    },
  ];

  return (
    <section id="pain-points" className="py-24 md:py-32 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#020617] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Client work is broken.
            </h2>
            <p className="text-slate-400 text-lg md:text-xl">
              You are hired for your expertise, but you spend half your time doing administrative gymnastics.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <ScrollReveal key={index} delay={index * 0.15} direction="up">
              <div className={`p-8 md:p-10 rounded-3xl glass-panel bg-slate-900/40 backdrop-blur-xl border border-white/5 h-full flex flex-col group transition-all duration-500 hover:bg-slate-900/60 ${point.accent} hover:shadow-2xl hover:-translate-y-2`}>
                <div className="mb-8 relative">
                  {/* Backdrop for the icon */}
                  <div className="absolute inset-0 bg-white/5 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative z-10">
                    {point.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{point.title}</h3>
                <p className="text-slate-400 leading-relaxed flex-1 text-lg">
                  {point.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
