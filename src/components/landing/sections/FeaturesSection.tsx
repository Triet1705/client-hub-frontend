"use client";

import { ScrollReveal } from "../effects/ScrollReveal";
import { GradientText } from "../effects/GradientText";
import { FolderKanban, MessageCircle, FileDown, HandCoins } from "lucide-react";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Decorative background glow removed, relying on ColorBendsBg */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <ScrollReveal>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
              Everything in <GradientText variant="emerald">one place.</GradientText>
            </h2>
            <p className="text-slate-400 text-lg">
              Replace your fragmented tool stack with a unified workspace built specifically for client-freelancer collaboration.
            </p>
          </ScrollReveal>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          
          {/* Large Feature 1 */}
          <ScrollReveal className="md:col-span-2">
            <div className="h-[350px] p-8 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FolderKanban className="w-48 h-48 text-emerald-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/30">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Project Workspaces</h3>
                <p className="text-slate-400 max-w-md">
                  Dedicated hubs for every project. Track milestones, share updates, and keep both parties aligned on deliverables without the noise.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Feature 1 */}
          <ScrollReveal delay={0.1}>
            <div className="h-[350px] p-8 rounded-3xl glass-panel glass-panel-hover flex flex-col group relative overflow-hidden">
               <div className="absolute -bottom-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <HandCoins className="w-32 h-32 text-blue-400" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 border border-blue-500/30">
                  <HandCoins className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Milestone Billing</h3>
                <p className="text-slate-400">
                  Tie payments directly to project milestones. Invoices trigger automatically upon approval.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Small Feature 2 */}
          <ScrollReveal delay={0.2}>
            <div className="h-[350px] p-8 rounded-3xl glass-panel glass-panel-hover flex flex-col group relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <MessageCircle className="w-32 h-32 text-purple-400" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center mb-6 border border-purple-500/30">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Contextual Chat</h3>
                <p className="text-slate-400">
                  Real-time messaging built directly into the workspace. Never lose a decision in an email thread again.
                </p>
              </div>
            </div>
          </ScrollReveal>

          {/* Large Feature 2 */}
          <ScrollReveal delay={0.3} className="md:col-span-2">
            <div className="h-[350px] p-8 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileDown className="w-48 h-48 text-amber-500" />
              </div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 border border-amber-500/30">
                  <FileDown className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">File Vault</h3>
                <p className="text-slate-400 max-w-md">
                  Secure, organized storage for all project assets and deliverables. Version control and easy access for both you and your clients.
                </p>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </div>
    </section>
  );
}
