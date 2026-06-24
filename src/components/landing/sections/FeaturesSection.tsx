"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";
import { CustomGraphic } from "../effects/CustomGraphics";
import { MilestoneIcon } from "../../icons";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 md:py-32 relative overflow-hidden bg-[#020617]">
      {/* Subtle background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <ScrollReveal>
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6">
              Everything in <GradientText variant="emerald">one place.</GradientText>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl">
              Replace your fragmented tool stack with a unified workspace built specifically for client-freelancer collaboration.
            </p>
          </ScrollReveal>
        </div>

        {/* Premium Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Large Feature 1 */}
          <ScrollReveal className="md:col-span-2">
            <div className="h-[400px] p-10 rounded-3xl glass-panel bg-slate-900/40 backdrop-blur-xl border border-emerald-500/10 flex flex-col justify-between group overflow-hidden relative hover:bg-slate-900/60 transition-all duration-500">
              <div className="absolute -top-10 -right-10 opacity-30 group-hover:opacity-60 transition-opacity duration-700">
                <CustomGraphic type="workspace" color="emerald" size={240} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <CustomGraphic type="workspace" color="emerald" size={64} className="mb-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">Project Workspaces</h3>
                  <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                    Dedicated hubs for every project. Track milestones, share updates, and keep both parties aligned on deliverables without the noise.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Feature 1 */}
          <ScrollReveal delay={0.1}>
            <div className="h-[400px] p-10 rounded-3xl glass-panel bg-slate-900/40 backdrop-blur-xl border border-blue-500/10 flex flex-col justify-between group overflow-hidden relative hover:bg-slate-900/60 transition-all duration-500">
               <div className="absolute -bottom-10 -right-10 opacity-20 group-hover:opacity-50 transition-opacity duration-700">
                <MilestoneIcon className="w-[200px] h-[200px]" primaryColor="#3b82f6" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <MilestoneIcon className="w-14 h-14 mb-6" primaryColor="#3b82f6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Milestone Billing</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Tie payments directly to project milestones. Invoices trigger automatically upon approval.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Feature 2 */}
          <ScrollReveal delay={0.2}>
            <div className="h-[400px] p-10 rounded-3xl glass-panel bg-slate-900/40 backdrop-blur-xl border border-purple-500/10 flex flex-col justify-between group overflow-hidden relative hover:bg-slate-900/60 transition-all duration-500">
              <div className="absolute -top-10 -left-10 opacity-20 group-hover:opacity-50 transition-opacity duration-700">
                <CustomGraphic type="chat" color="purple" size={200} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="self-end">
                  <CustomGraphic type="chat" color="purple" size={56} className="mb-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-3">Contextual Chat</h3>
                  <p className="text-slate-400 leading-relaxed">
                    Real-time messaging built directly into the workspace. Never lose a decision in an email thread again.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Large Feature 2 */}
          <ScrollReveal delay={0.3} className="md:col-span-2">
            <div className="h-[400px] p-10 rounded-3xl glass-panel bg-slate-900/40 backdrop-blur-xl border border-amber-500/10 flex flex-col justify-between group overflow-hidden relative hover:bg-slate-900/60 transition-all duration-500">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-30 transition-opacity duration-700">
                <CustomGraphic type="vault" color="amber" size={300} />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 flex flex-col h-full justify-between items-end text-right">
                <div className="w-full flex justify-start">
                  <CustomGraphic type="vault" color="amber" size={64} className="mb-6" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-4">File Vault</h3>
                  <p className="text-slate-400 text-lg max-w-md ml-auto leading-relaxed">
                    Secure, organized storage for all project assets and deliverables. Version control and easy access for both you and your clients.
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
