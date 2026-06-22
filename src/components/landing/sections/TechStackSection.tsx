"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";

export function TechStackSection() {
  const technologies = [
    "Next.js", "React", "TypeScript", "Tailwind CSS",
    "Framer Motion", "Supabase", "PostgreSQL", "Web3j", 
    "Hardhat", "Polygon Amoy", "Spring Boot", "Java"
  ];

  // We duplicate the array to create a seamless infinite loop
  const duplicatedTechnologies = [...technologies, ...technologies, ...technologies];

  return (
    <section id="proof" className="py-24 relative overflow-hidden bg-[#020617]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="text-center max-w-3xl mx-auto">
          <ScrollReveal>
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6">
              Powered by <GradientText variant="default">enterprise tech.</GradientText>
            </h2>
            <p className="text-slate-400 text-lg">
              Built on a foundation of modern, scalable technologies. No black boxes, just rock-solid engineering.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="w-full relative py-8 overflow-hidden">
        {/* Fading edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-[#020617] to-transparent z-10" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-[#020617] to-transparent z-10" />
        
        {/* CSS-only Ticker */}
        <div className="flex gap-8 whitespace-nowrap animate-[scroll_40s_linear_infinite] w-max hover:[animation-play-state:paused]">
          {duplicatedTechnologies.map((tech, i) => (
             <div key={i} className="px-6 py-3 rounded-xl bg-slate-800/30 border border-slate-700/50 flex items-center justify-center min-w-[160px]">
               <span className="text-slate-400 font-semibold">{tech}</span>
             </div>
          ))}
        </div>
      </div>
    </section>
  );
}
