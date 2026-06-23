"use client";

import { motion } from "framer-motion";
import { FileText, ArrowRight } from "lucide-react";

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative w-full max-w-[1200px] mx-auto mt-24 perspective-1000"
    >
      {/* Outer Glow effect removed to rely on ColorBendsBg */}

      {/* Main Mockup Container */}
      <div className="relative rounded-2xl glass-panel shadow-2xl overflow-hidden ring-1 ring-white/10 border-none">
        
        {/* Browser / App Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-[#0a0a0a]/50">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-700" />
            <div className="w-3 h-3 rounded-full bg-slate-700" />
          </div>
          <div className="mx-auto px-24">
            <div className="h-4 w-48 bg-slate-800/80 rounded mx-auto" />
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex h-[400px] sm:h-[500px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-64 border-r border-slate-800 bg-[#020617]/30 flex-col gap-4 p-4">
            <div className="h-8 w-3/4 bg-slate-800 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded bg-slate-800" />
                  <div className="h-4 w-2/3 bg-slate-800 rounded" />
                </div>
              ))}
            </div>
            <div className="mt-auto h-24 w-full bg-gradient-to-br from-emerald-900/20 to-slate-800 rounded-lg border border-emerald-500/10 p-3">
               <div className="h-3 w-1/2 bg-emerald-500/40 rounded mb-2" />
               <div className="h-2 w-3/4 bg-slate-700 rounded mb-1" />
               <div className="h-2 w-2/3 bg-slate-700 rounded" />
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 sm:p-8 bg-transparent relative overflow-hidden">
            {/* Background subtle grid */}
            <div className="absolute inset-0 bg-grid-slate-800/[0.2] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
            
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex justify-between items-center">
                <div>
                  <div className="h-8 w-48 bg-slate-200/90 rounded mb-2" />
                  <div className="h-4 w-64 bg-slate-500 rounded" />
                </div>
                <div className="hidden md:block h-10 w-32 bg-emerald-500 rounded-lg opacity-90" />
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="h-3 w-20 bg-slate-500 rounded mb-3" />
                    <div className="h-8 w-24 bg-slate-300 rounded" />
                  </div>
                ))}
              </div>

              {/* Activity Table Mock */}
              <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-4">
                <div className="h-5 w-32 bg-slate-400 rounded" />
                <div className="space-y-3 mt-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-700/50 pb-3 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <div className="h-4 w-32 bg-slate-300 rounded mb-1" />
                          <div className="h-3 w-24 bg-slate-500 rounded" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {i === 1 && <span className="px-2 py-1 rounded text-[10px] uppercase font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Verified</span>}
                        <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center">
                           <ArrowRight className="w-3 h-3 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
