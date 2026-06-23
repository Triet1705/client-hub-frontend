"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { MessageSquareOff, FileWarning, Wallet } from "lucide-react";

export function PainPointsSection() {
  const painPoints = [
    {
      icon: <MessageSquareOff className="w-6 h-6 text-rose-400" />,
      title: "Scattered Communication",
      description: "Emails, Slack, WhatsApp. Finding that one important file or approval message becomes a scavenger hunt.",
    },
    {
      icon: <Wallet className="w-6 h-6 text-amber-400" />,
      title: "Chasing Payments",
      description: "Awkward follow-ups for late invoices. Doing the work on time but waiting 30+ days to see the money.",
    },
    {
      icon: <FileWarning className="w-6 h-6 text-orange-400" />,
      title: "Scope Creep & Disputes",
      description: "\"Can you just add this one thing?\" Without a clear, agreed-upon record, expectations misalign.",
    },
  ];

  return (
    <section id="pain-points" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              Client work is broken.
            </h2>
            <p className="text-slate-400 text-lg">
              You are hired for your expertise, but you spend half your time doing administrative gymnastics.
            </p>
          </ScrollReveal>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {painPoints.map((point, index) => (
            <ScrollReveal key={index} delay={index * 0.1} direction="up">
              <div className="p-8 rounded-2xl glass-panel glass-panel-hover h-full flex flex-col">
                <div className="w-12 h-12 rounded-lg bg-[#111111] flex items-center justify-center border border-white/5 mb-6 shadow-inner">
                  {point.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{point.title}</h3>
                <p className="text-slate-400 leading-relaxed flex-1">
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
