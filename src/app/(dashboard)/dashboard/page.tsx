import * as React from "react";
import { Metadata } from "next";
import Link from "next/link";
import {
  NavProjectsIcon,
  NavTasksIcon,
  NavInvoicesIcon,
  BlockchainPendingIcon,
  ActionPlusIcon,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Client Hub | Overview",
  description: "Your workspace overview and escrow status.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-space-grotesk font-bold text-white tracking-tight">
            Workspace Overview
          </h1>
          <p className="text-slate-400 mt-1">
            Here is what happening in your projects today.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <ActionPlusIcon className="w-4 h-4" />
            New Task
          </button>
          <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20">
            <ActionPlusIcon className="w-4 h-4" />
            Create Project
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <NavProjectsIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              +2 this week
            </span>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">
              Active Projects
            </h3>
            <p className="text-3xl font-bold text-white mt-1">12</p>
          </div>
        </div>

        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <NavTasksIcon className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">
              Pending Tasks
            </h3>
            <p className="text-3xl font-bold text-white mt-1">34</p>
          </div>
        </div>

        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <NavInvoicesIcon className="w-6 h-6" />
            </div>
            <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
              Action needed
            </span>
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">
              Awaiting Payment
            </h3>
            <p className="text-3xl font-bold text-white mt-1">
              $4,250<span className="text-sm text-slate-500 ml-1">.00</span>
            </p>
          </div>
        </div>

        <div className="rainbow-border relative bg-[#020617] p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <BlockchainPendingIcon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold ml-1">
                On-Chain
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium">
              Escrow Locked (USDT)
            </h3>
            <p className="text-3xl font-bold text-white mt-1">
              12,500<span className="text-sm text-slate-500 ml-1">.00</span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
              >
                View All →
              </Link>
            </div>

            {/* Placeholder for Data Table */}
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
              <NavProjectsIcon className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">
                No projects found for this tenant.
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Create a new project to get started.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-6">
              Blockchain Activity
            </h2>

            {/* Placeholder for Audit Log / Web3 Events */}
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10" />
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">
                      Funds Released to Escrow
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tx: 0x1234...abcd • 2h ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
