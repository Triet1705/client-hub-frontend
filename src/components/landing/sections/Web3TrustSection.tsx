"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { CustomGraphic } from "../effects/CustomGraphics";
import { GradientText } from "../effects/GradientText";

export function Web3TrustSection() {
  return (
    <section className="py-24 relative border-t border-slate-800/50 bg-[#020617]/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 mb-6 text-blue-400 text-xs font-semibold uppercase tracking-wider">
                <CustomGraphic type="audit" color="blue" size={16} />
                Verified Trust
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-6 leading-tight">
                Trust by design, <br />
                <GradientText variant="default">not just by promise.</GradientText>
              </h2>
              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                We blend the seamless experience of modern Web2 platforms with the irrefutable security of Web3. Optional escrow and cryptographic audit logs ensure both parties are always protected.
              </p>
            </ScrollReveal>

            <div className="space-y-8">
              <ScrollReveal delay={0.1}>
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CustomGraphic type="escrow" color="emerald" size={48} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-2">Optional Smart Escrow</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Lock funds in a smart contract. The client knows their money is safe, and the freelancer knows they&apos;ll get paid upon approval. Web2 fallback always available.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.2}>
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CustomGraphic type="audit" color="blue" size={48} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-2">Hash-Backed Audit Trails</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Every critical action—approvals, milestone updates, payments—is cryptographically hashed. A clear, undisputed record if disagreements arise.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={0.3}>
                <div className="flex gap-4">
                  <div className="mt-1 flex-shrink-0">
                    <CustomGraphic type="reputation" color="purple" size={48} />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg mb-2">Soulbound Reputation</h4>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      Build a verifiable professional identity. Completed projects contribute to an immutable track record that you truly own.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>

          <div className="flex-1 w-full relative">
            <ScrollReveal delay={0.2} direction="left">
               {/* Decorative Trust visual */}
               <div className="relative w-full aspect-square max-w-md mx-auto">
                 <div className="absolute inset-0 rounded-full border border-slate-800 animate-[spin_60s_linear_infinite]" />
                 <div className="absolute inset-4 rounded-full border border-slate-700 border-dashed animate-[spin_40s_linear_infinite_reverse]" />
                 <div className="absolute inset-12 rounded-full border border-emerald-500/20 bg-emerald-500/5" />
                 
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-[#0f172a] border border-slate-700 p-6 rounded-2xl shadow-2xl relative z-10 w-64">
                      <div className="flex items-center gap-3 mb-4 border-b border-slate-800 pb-4">
                        <div className="w-10 h-10 flex flex-shrink-0 items-center justify-center">
                          <CustomGraphic type="lock" color="emerald" size={40} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">Escrow Locked</div>
                          <div className="text-xs text-emerald-400">0x8a9F...3b21</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Milestone 1</span>
                          <span className="text-white font-medium">$1,200</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-400">Status</span>
                          <span className="text-emerald-400 font-medium">Secured</span>
                        </div>
                      </div>
                    </div>
                 </div>
               </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
}

