"use client";

import * as React from "react";
import Link from "next/link";
import {
  NavProjectsIcon,
  NavTasksIcon,
  NavInvoicesIcon,
  BlockchainPendingIcon,
  ActionPlusIcon,
} from "@/components/icons";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useDashboardStatsQuery, useTaskSummaryQuery } from "@/features/dashboard/hooks/use-dashboard";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { formatFiat as formatCurrency } from "@/lib/utils";
import { SummaryCard } from "@/components/ui/summary-card";
import { TodayFocusBlock } from "./today-focus-block";
import { TaskOverviewChart } from "./task-overview-chart";
import { ActivityFeed } from "./activity-feed";
import { ProjectRow } from "./project-row";

// ─── #3: Role-Specific Greeting ───────────────────────────────────────────────

function getRoleContext(role: string): { greeting: string; subtitle: string } {
  switch (role) {
    case "CLIENT":
      return {
        greeting: "Client Dashboard",
        subtitle: "Track payment risk, approvals, and project health.",
      };
    case "FREELANCER":
      return {
        greeting: "My Workspace",
        subtitle: "Your active tasks, pending invoices, and runway.",
      };
    case "ADMIN":
      return {
        greeting: "Admin Overview",
        subtitle: "System health, tenant activity, and core signals.",
      };
    default:
      return {
        greeting: "Workspace Overview",
        subtitle: "Here is your operational snapshot for today.",
      };
  }
}

// ─── Main DashboardClient ─────────────────────────────────────────────────────

export function DashboardClient() {
  const { data: projectsData, isLoading: projectsLoading } = useProjectsQuery(0, 5);
  const { data: statsData,    isLoading: statsLoading    } = useDashboardStatsQuery();
  const { data: taskSummary,  isLoading: taskSummaryLoading } = useTaskSummaryQuery();
  const { user } = useAuthStore();

  const role       = user?.role ?? "GUEST";
  const canCreate  = role === "CLIENT" || role === "ADMIN";
  const recentProjects    = projectsData?.content ?? [];
  const pendingTasks      = statsData?.pendingTasks ?? 0;
  const awaitingPayment   = statsData?.awaitingPaymentAmount ?? "0";
  const { greeting, subtitle } = getRoleContext(role);

  return (
    <div className="space-y-8 pb-12 pt-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* #3: Role-specific heading */}
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-white tracking-tight drop-shadow-sm">
            {greeting}
          </h1>
          <p className="text-slate-400 mt-2 text-sm md:text-base max-w-xl leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {canCreate && (
            <Link
              href="/projects"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <ActionPlusIcon className="w-4 h-4" />
              New Project
            </Link>
          )}
        </div>
      </div>

      {/* ── #2: Today Focus Action Block ── */}
      <TodayFocusBlock
        role={role}
        projects={recentProjects}
        pendingTasks={pendingTasks}
        awaitingPayment={awaitingPayment}
        isLoading={projectsLoading || statsLoading}
      />

      {/* ── #5: Asymmetric Stat Cards (1 large + 3 compact) ── */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Primary / Large card */}
        <div className="md:col-span-4 relative bg-slate-900/80 backdrop-blur-xl ring-1 ring-white/10 p-8 rounded-3xl flex flex-col justify-between shadow-2xl shadow-black overflow-hidden group">
          {/* Subtle gradient background for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-slate-950/50 ring-1 ring-white/10 rounded-2xl text-emerald-400 shadow-inner">
              <BlockchainPendingIcon className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 ring-1 ring-emerald-500/20 px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                On-Chain
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-slate-400 text-sm font-medium">Escrow Locked (USDT)</h3>
            <p className="text-4xl lg:text-5xl font-bold text-white mt-1 font-space-grotesk tracking-tight">
              {statsLoading ? (
                <span className="inline-block w-32 h-12 rounded-lg bg-slate-800 animate-pulse" />
              ) : (
                formatCurrency(statsData?.escrowLocked ?? "0")
              )}
            </p>
            <p className="text-xs text-slate-500 mt-3 max-w-xs leading-relaxed">
              Smart contract holds release on milestone approval. Fully secured on the blockchain.
            </p>
          </div>
        </div>

        {/* Secondary compact cards – 3 across the remaining 8 cols */}
        <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <SummaryCard
            label="Active Projects"
            value={statsData?.activeProjects ?? "—"}
            icon={NavProjectsIcon}
            iconClassName="text-blue-400"
            badge={{ label: "Active", variant: "emerald" }}
            isLoading={statsLoading}
          />

          <SummaryCard
            label="Pending Tasks"
            value={pendingTasks}
            icon={NavTasksIcon}
            iconClassName="text-amber-400"
            badge={{ 
              label: pendingTasks === 0 ? "All clear" : `${pendingTasks} open`, 
              variant: "amber" 
            }}
            isLoading={statsLoading}
          />

          <SummaryCard
            label="Awaiting Payment"
            value={formatCurrency(awaitingPayment)}
            icon={NavInvoicesIcon}
            iconClassName="text-rose-400"
            badge={{ 
              label: parseFloat(awaitingPayment) > 0 ? "Action needed" : "All clear", 
              variant: "rose" 
            }}
            isLoading={statsLoading}
          />
        </div>
      </div>

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects (spans 2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl p-7 shadow-2xl shadow-black/50 transition-all hover:bg-slate-900/80">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-space-grotesk font-semibold text-slate-100">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-sm text-emerald-400 hover:text-emerald-300 font-bold transition-colors group flex items-center gap-1"
              >
                View Directory <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full animate-pulse rounded-2xl bg-slate-800/50"
                  />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 bg-white/[0.02] rounded-3xl">
                <div className="p-4 bg-slate-800/50 rounded-full mb-4 ring-1 ring-white/10">
                  <NavProjectsIcon className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-slate-200 font-medium text-lg">No projects found</p>
                <p className="text-slate-500 text-sm mt-2 max-w-sm text-center">
                  Your workspace is empty. Create a new project to start collaborating.
                </p>
                {canCreate && (
                   <Link
                    href="/projects"
                    className="mt-6 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ring-1 ring-white/10"
                  >
                    <ActionPlusIcon className="w-4 h-4" />
                    Create First Project
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* #4: ProjectRow now shows insight line */}
                {recentProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (1/3) */}
        <div className="space-y-8">
          <TaskOverviewChart taskSummary={taskSummary} isLoading={taskSummaryLoading} />

          {/* #1: Real Activity Feed */}
          <ActivityFeed
            projects={recentProjects}
            pendingTasks={pendingTasks}
            awaitingPayment={awaitingPayment}
            isLoading={projectsLoading || statsLoading}
          />
        </div>
      </div>
    </div>
  );
}
