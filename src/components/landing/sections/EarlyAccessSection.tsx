"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { ArrowRight } from "lucide-react";

export function EarlyAccessSection() {
  return (
    <section id="early-access" className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-emerald-900/10" />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <ScrollReveal>
          <div className="glass-panel p-8 md:p-16 rounded-3xl border border-emerald-500/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
            
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
              Ready to professionalize your client work?
            </h2>
            <p className="text-slate-400 text-lg mb-10 max-w-2xl mx-auto">
              Join the beta today. Get early access to the unified workspace designed for modern freelancers and agencies.
            </p>
            
            <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 px-6 py-4 rounded-xl bg-[#020617] border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                required
              />
              <button 
                type="submit"
                className="px-8 py-4 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-[#020617] whitespace-nowrap flex items-center justify-center gap-2 group"
              >
                Join Waitlist
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
            
            <p className="text-slate-500 text-sm mt-6">
              No credit card required. Free during beta.
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
