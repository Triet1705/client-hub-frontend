"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";

export function EarlyAccessSection() {
  return (
    <section id="early-access" className="py-32 relative overflow-hidden bg-[#020617]">
      {/* Intense center glow for CTA */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl h-[400px] bg-emerald-500/20 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="glass-panel p-10 md:p-16 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-xl text-center relative overflow-hidden group shadow-2xl">
            {/* Animated top border line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-white opacity-0 group-hover:opacity-50 blur-[2px] transition-opacity duration-500" />
            
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Ready to professionalize <br className="hidden md:block" /> your <GradientText variant="emerald">client work?</GradientText>
            </h2>
            <p className="text-slate-300 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
              Join the beta today. Get early access to the unified workspace designed exclusively for modern freelancers and agencies.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 px-6 py-4 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all text-lg shadow-inner"
                required
              />
              <button 
                type="submit"
                className="px-8 py-4 rounded-2xl bg-emerald-500 text-white font-bold hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#020617] whitespace-nowrap flex items-center justify-center gap-3 text-lg"
              >
                Join Waitlist
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform group-hover:translate-x-1 transition-transform">
                  <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </form>
            
            <p className="text-slate-500 text-sm mt-8 font-medium">
              No credit card required. Free during the beta period.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
