"use client";

import { motion } from "framer-motion";
import { 
  FileText, LayoutDashboard, Wallet, 
  Briefcase, CheckCircle2, Search, Bell, Plus,
  ShieldCheck, CircleDollarSign
} from "lucide-react";

export function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1.2, delay: 0.2, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="relative w-full max-w-[1200px] mx-auto mt-24 perspective-1000 z-10"
    >
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Mockup Container */}
      <div className="relative rounded-2xl glass-panel shadow-2xl overflow-hidden ring-1 ring-white/10 border border-white/5 bg-[#020617]/60 backdrop-blur-2xl">
        
        {/* Browser / App Header */}
        <div className="flex items-center px-4 py-3 border-b border-white/5 bg-slate-900/40">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <div className="mx-auto flex items-center justify-center bg-slate-800/50 rounded-md px-3 py-1 gap-2 border border-white/5">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium tracking-wide">app.clienthub.network</span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex h-[500px] sm:h-[600px]">
          {/* Sidebar */}
          <div className="hidden sm:flex w-64 border-r border-slate-800/50 bg-[#020617]/50 flex-col py-6 px-4">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <div className="w-4 h-4 rounded-sm bg-emerald-400" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Client Hub</span>
            </div>
            
            <div className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Overview", active: true },
                { icon: Briefcase, label: "Projects", active: false },
                { icon: Wallet, label: "Escrow Wallet", active: false },
                { icon: FileText, label: "Contracts", active: false },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer ${
                    item.active 
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>

            {/* User Profile Mini */}
            <div className="mt-auto border-t border-slate-800/50 pt-4 px-2 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-lg">
                <span className="text-sm font-bold text-white">0x</span>
              </div>
              <div>
                <div className="text-sm font-medium text-white">0x742d...8F4a</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                </div>
              </div>
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 p-6 sm:p-8 bg-transparent relative overflow-hidden flex flex-col">
            {/* Background subtle grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            
            <div className="relative z-10 flex flex-col gap-6 h-full">
              {/* Top Nav inside dashboard */}
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Overview</h2>
                  <p className="text-sm text-slate-400">Welcome back, your freelance business is looking good.</p>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-full py-2 pl-9 pr-4 w-64 text-sm text-slate-400">Search projects...</div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-300">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <Plus className="w-4 h-4" /> New Project
                  </div>
                </div>
              </div>

              {/* Stats Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Balance Card - Span 2 */}
                <div className="col-span-1 md:col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-emerald-500/10 transition-colors duration-500" />
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div>
                      <div className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-emerald-400" /> Total Balance in Escrow
                      </div>
                      <div className="text-4xl font-bold text-white">$14,250.00</div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      +12.5% this month
                    </div>
                  </div>
                  
                  {/* Fake glowing chart */}
                  <div className="h-24 w-full relative z-10 mt-auto flex items-end">
                    <svg viewBox="0 0 400 100" className="w-full h-full preserve-aspect-ratio-none drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                      <path 
                        d="M0 100 L 0 50 Q 50 40 100 60 T 200 40 T 300 30 T 400 10 L 400 100 Z" 
                        fill="url(#gradient)" 
                        opacity="0.2"
                      />
                      <path 
                        d="M0 50 Q 50 40 100 60 T 200 40 T 300 30 T 400 10" 
                        fill="none" 
                        stroke="#10b77f" 
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b77f" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Smaller Card */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-400 mb-1 flex items-center gap-2">
                      <CircleDollarSign className="w-4 h-4 text-blue-400" /> Released this month
                    </div>
                    <div className="text-2xl font-bold text-white">$4,800.00</div>
                  </div>
                  <div className="mt-4 p-3 rounded-lg bg-slate-900/50 border border-slate-700/30">
                    <div className="flex justify-between items-center text-sm mb-2">
                      <span className="text-slate-400">Project Alpha</span>
                      <span className="text-white font-medium">100%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Table Mock */}
              <div className="flex-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-white">Recent Smart Contract Activity</h3>
                  <span className="text-sm text-emerald-400 cursor-pointer hover:underline">View all on Polygon</span>
                </div>
                
                <div className="space-y-4 mt-2 overflow-y-auto pr-2">
                  {[
                    { title: "Milestone 2 Approved", project: "Web3 Agency Site", amount: "$2,500.00", status: "Released", icon: CheckCircle2, color: "emerald" },
                    { title: "Funds Locked in Escrow", project: "DeFi Dashboard App", amount: "$8,000.00", status: "Secured", icon: ShieldCheck, color: "blue" },
                    { title: "Contract Deployed", project: "NFT Marketplace", amount: "Gas: 0.002 POL", status: "Confirmed", icon: FileText, color: "purple" },
                  ].map((tx, i) => (
                    <div key={i} className="flex justify-between items-center border-b border-slate-700/50 pb-4 last:border-0 last:pb-0 hover:bg-slate-800/30 p-2 -mx-2 rounded-lg transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full bg-${tx.color}-500/20 flex items-center justify-center border border-${tx.color}-500/30 group-hover:scale-110 transition-transform`}>
                          <tx.icon className={`w-5 h-5 text-${tx.color}-400`} />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white mb-0.5">{tx.title}</div>
                          <div className="text-xs text-slate-400">{tx.project}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-bold text-white">{tx.amount}</span>
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-${tx.color}-500/10 text-${tx.color}-400 border border-${tx.color}-500/20`}>
                            {tx.status}
                          </span>
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
