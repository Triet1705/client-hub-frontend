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
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";

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
  const isColdLoading =
    (projectsLoading || statsLoading || taskSummaryLoading) &&
    !projectsData &&
    !statsData &&
    !taskSummary;

  if (isColdLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-8 pb-12 pt-4">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          {/* #3: Role-specific heading */}
          <h1 className="text-4xl md:text-5xl font-space-grotesk font-bold text-content-primary tracking-tight drop-shadow-sm">
            {greeting}
          </h1>
          <p className="text-content-secondary mt-2 text-sm md:text-base max-w-xl leading-relaxed">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {canCreate && (
            <Link
              href="/projects"
              className="flex items-center gap-2 rounded-xl bg-action-primary px-5 py-2.5 text-sm font-bold text-action-primary-foreground shadow-[0_8px_20px_var(--shadow-color)] transition-all hover:-translate-y-0.5 hover:bg-action-primary-hover hover:shadow-[0_10px_24px_var(--shadow-color)] active:translate-y-0"
            >
              <ActionPlusIcon
                className="w-4 h-4"
                primaryColor="currentColor"
                accentColor="currentColor"
              />
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
        <div className="web3-hero-card md:col-span-4 relative bg-surface/80 backdrop-blur-xl ring-1 ring-theme-border p-6 sm:p-8 rounded-3xl flex flex-col justify-between shadow-2xl shadow-theme overflow-hidden group">
          {/* Subtle gradient background for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-action-subtle via-transparent to-transparent opacity-50 pointer-events-none" />
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-action-subtle blur-3xl rounded-full pointer-events-none group-hover:bg-action-subtle transition-all duration-700" />

          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-surface-base/50 ring-1 ring-theme-border rounded-2xl text-theme-accent shadow-inner">
              <BlockchainPendingIcon className="w-8 h-8" />
            </div>
            <div className="flex items-center gap-1.5 bg-action-subtle ring-1 ring-theme-accent px-3 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-success-text opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-status-success-text" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-theme-accent font-bold">
                On-Chain
              </span>
            </div>
          </div>
          <div className="relative z-10 mt-auto">
            <h3 className="text-content-secondary text-sm font-medium">Escrow Locked (USDT)</h3>
            <p className="text-4xl lg:text-5xl font-bold text-content-primary mt-1 font-space-grotesk tracking-tight">
              {statsLoading ? (
                <span className="inline-block w-32 h-12 rounded-lg bg-surface-elevated animate-pulse" />
              ) : (
                formatCurrency(statsData?.escrowLocked ?? "0")
              )}
            </p>
            <p className="text-xs text-content-muted mt-3 max-w-xs leading-relaxed">
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
            iconClassName="text-status-info-text"
            badge={{ label: "Active", variant: "emerald" }}
            isLoading={statsLoading}
          />

          <SummaryCard
            label="Pending Tasks"
            value={pendingTasks}
            icon={NavTasksIcon}
            iconClassName="text-status-warning-text"
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
            iconClassName="text-status-danger-text"
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
          <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border rounded-3xl p-5 sm:p-7 shadow-2xl shadow-theme transition-all hover:bg-surface/80">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-space-grotesk font-semibold text-content-primary">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-sm text-theme-accent hover:text-theme-accent font-bold transition-colors group flex items-center gap-1"
              >
                View Directory <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            {projectsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-20 w-full animate-pulse rounded-2xl bg-surface-elevated/50"
                  />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-theme-border bg-surface-elevated/50 rounded-3xl">
                <div className="p-4 bg-surface-elevated/50 rounded-full mb-4 ring-1 ring-theme-border">
                  <NavProjectsIcon
                    className="w-8 h-8 text-content-secondary"
                    primaryColor="currentColor"
                    accentColor="currentColor"
                  />
                </div>
                <p className="text-content-secondary font-medium text-lg">No projects found</p>
                <p className="text-content-muted text-sm mt-2 max-w-sm text-center">
                  Your workspace is empty. Create a new project to start collaborating.
                </p>
                {canCreate && (
                   <Link
                    href="/projects"
                    className="mt-6 flex items-center gap-2 bg-surface-elevated hover:bg-surface-sunken text-content-primary px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ring-1 ring-theme-border"
                  >
                    <ActionPlusIcon
                      className="w-4 h-4"
                      primaryColor="currentColor"
                      accentColor="currentColor"
                    />
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
