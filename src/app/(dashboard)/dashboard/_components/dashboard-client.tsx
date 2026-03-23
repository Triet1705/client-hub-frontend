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
import { Project, ProjectStatus } from "@/features/projects/types/project.types";
import { useDashboardStatsQuery, useTaskSummaryQuery } from "@/features/dashboard/hooks/use-dashboard";
import type { TaskSummary } from "@/features/dashboard/types/dashboard.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { cn } from "@/lib/utils";

// ─── Utilities ────────────────────────────────────────────────────────────────

function formatCurrency(value: string | number | null | undefined): string {
  if (value == null) return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  return Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const days = daysUntil(deadline);
  if (days === null) return <span className="text-slate-500 text-xs font-medium">No deadline</span>;
  if (days < 0)
    return (
      <span className="text-xs font-semibold text-rose-400 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20 px-2.5 py-0.5 rounded-full">
        Overdue
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 px-2.5 py-0.5 rounded-full">
        In {days}d
      </span>
    );
  return (
    <span className="text-xs font-medium text-slate-400 bg-slate-800/50 ring-1 ring-inset ring-slate-700/50 px-2.5 py-0.5 rounded-full">
      In {days}d
    </span>
  );
}

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  [ProjectStatus.PLANNING]: {
    label: "Planning",
    className: "text-slate-300 bg-slate-800/80 ring-1 ring-inset ring-slate-700/50 shadow-sm",
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "text-blue-400 bg-blue-500/10 ring-1 ring-inset ring-blue-500/20 shadow-sm shadow-blue-500/10",
  },
  [ProjectStatus.ON_HOLD]: {
    label: "On Hold",
    className: "text-amber-400 bg-amber-500/10 ring-1 ring-inset ring-amber-500/20 shadow-sm shadow-amber-500/10",
  },
  [ProjectStatus.COMPLETED]: {
    label: "Completed",
    className: "text-emerald-400 bg-emerald-500/10 ring-1 ring-inset ring-emerald-500/20 shadow-sm shadow-emerald-500/10",
  },
  [ProjectStatus.CANCELLED]: {
    label: "Cancelled",
    className: "text-rose-400 bg-rose-500/10 ring-1 ring-inset ring-rose-500/20 shadow-sm shadow-rose-500/10",
  },
};

// ─── Task Overview Chart ───────────────────────────────────────────────────────

function TaskOverviewChart({
  taskSummary,
  isLoading,
}: {
  taskSummary: TaskSummary | undefined;
  isLoading: boolean;
}) {
  const todo       = taskSummary?.todo       ?? 0;
  const inProgress = taskSummary?.inProgress ?? 0;
  const done       = taskSummary?.done       ?? 0;
  const total      = taskSummary?.total      ?? 0;

  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  const bars = [
    { label: "To Do",       count: todo,       color: "bg-slate-500" },
    { label: "In Progress", count: inProgress, color: "bg-blue-500" },
    { label: "Done",        count: done,       color: "bg-emerald-500" },
  ];
  const maxCount = Math.max(todo, inProgress, done, 1);
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl p-7 shadow-2xl shadow-black/50 transition-all hover:bg-slate-900/80 group/chart">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-space-grotesk font-semibold text-slate-100">Task Overview</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/50 ring-1 ring-white/10 shadow-inner">
          <span className="text-xs text-slate-400">Completion</span>
          <span className="text-sm font-bold text-emerald-400">{completionRate}%</span>
        </div>
      </div>

      <div className="mb-8 relative">
        <div className="absolute inset-0 border-b border-white/5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="flex items-end gap-3 h-32 px-2 relative z-10">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-full flex items-end h-24">
                    <div className="w-full rounded-t-lg bg-slate-800/50 animate-pulse" style={{ height: "60%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500">&nbsp;</span>
                </div>
              ))
            : bars.map((item) => {
                const heightPct = Math.max(15, (item.count / maxCount) * 100);
                return (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col items-center gap-3 group/bar"
                  >
                    <div className="w-full flex items-end h-24 relative">
                      <div
                        className={cn(
                          "w-full rounded-t-xl transition-all duration-700 ease-out group-hover/bar:brightness-110 shadow-lg",
                          item.color,
                        )}
                        style={{ height: `${heightPct}%` }}
                      >
                         <div className="h-full w-full bg-gradient-to-t from-black/20 to-transparent rounded-t-xl" />
                      </div>
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none">
                        {item.count}
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-400 group-hover/bar:text-slate-200 transition-colors">{item.label}</span>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="space-y-3">
        {bars.map((item) => (
          <div key={item.label} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors flex-1 min-w-[33%]">
            <div className="flex items-center gap-3">
              <div className={cn("w-3 h-3 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]", item.color)} />
              <span className="text-sm font-medium text-slate-300">{item.label}</span>
            </div>
            {isLoading ? (
              <div className="w-6 h-5 rounded bg-slate-800 animate-pulse" />
            ) : (
              <span className="text-base font-bold text-white">{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── #1: Real Activity Feed (replaces hardcoded BLOCKCHAIN_EVENTS) ─────────────

interface ActivityItem {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  time: string;
  dot: string;
  badge?: { label: string; cls: string };
}

function buildActivityFeed(
  projects: Project[],
  pendingTasks: number,
  awaitingPayment: string,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  // Derive activity signals from real project data
  projects.slice(0, 3).forEach((p, i) => {
    const days = daysUntil(p.deadline);
    const isOverdue = days !== null && days < 0;
    const isDueSoon = days !== null && days >= 0 && days <= 3;
    const isOnHold  = p.status === ProjectStatus.ON_HOLD;

    let badge: ActivityItem["badge"] | undefined;
    if (isOverdue) badge = { label: "Action needed", cls: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/30" };
    else if (isDueSoon) badge = { label: "Due soon", cls: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/30" };
    else if (isOnHold) badge = { label: "On Hold", cls: "bg-amber-500/10 text-amber-400 ring-1 ring-inset ring-amber-500/30" };

    items.push({
      id: `project-${p.id}-${i}`,
      icon: "🗂️",
      title: p.title,
      subtitle: `Project · ${STATUS_STYLES[p.status].label}`,
      time: p.deadline ? `Deadline: ${new Date(p.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}` : "No deadline",
      dot: isOverdue ? "bg-rose-500 ring-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.6)]" 
           : isDueSoon ? "bg-amber-500 ring-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.6)]" 
           : "bg-blue-500 ring-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.6)]",
      badge,
    });
  });

  // Invoice signal: show if there's awaiting payment
  if (parseFloat(awaitingPayment || "0") > 0) {
    items.unshift({
      id: "invoice-awaiting",
      icon: "📋",
      title: `${formatCurrency(awaitingPayment)} awaiting payment`,
      subtitle: "Invoice · Pending approval",
      time: "Requires attention",
      dot: "bg-rose-500 ring-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.6)]",
      badge: { label: "Action needed", cls: "bg-rose-500/10 text-rose-400 ring-1 ring-inset ring-rose-500/30" },
    });
  }

  // Task signal: show if there are pending tasks
  if (pendingTasks > 0) {
    items.push({
      id: "tasks-pending",
      icon: "✅",
      title: `${pendingTasks} task${pendingTasks > 1 ? "s" : ""} in progress`,
      subtitle: "Tasks · Across all projects",
      time: "Active right now",
      dot: "bg-emerald-500 ring-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.6)]",
    });
  }

  return items.slice(0, 4);
}

function ActivityFeed({
  projects,
  pendingTasks,
  awaitingPayment,
  isLoading,
}: {
  projects: Project[];
  pendingTasks: number;
  awaitingPayment: string;
  isLoading: boolean;
}) {
  const items = buildActivityFeed(projects, pendingTasks, awaitingPayment);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl p-7 shadow-2xl shadow-black/50 transition-all hover:bg-slate-900/80">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-space-grotesk font-semibold text-slate-100">Recent Activity</h2>
        <Link
          href="/projects"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest flex items-center gap-1 group"
        >
          View All <span className="group-hover:translate-x-1 transition-transform">→</span>
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-2.5 h-2.5 rounded-full mt-1.5 bg-slate-800 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-slate-800 animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-slate-800/60 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-6">No recent activity.</p>
      ) : (
        <div className="space-y-6 relative">
          <div className="absolute left-[5px] top-3 bottom-3 w-px bg-slate-800/60" />
          {items.map((event) => (
            <div key={event.id} className="flex gap-4 items-start relative group cursor-default">
              <div className="mt-1.5 shrink-0 relative z-10">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full ring-4 transition-all duration-300 group-hover:scale-110",
                    event.dot,
                  )}
                />
              </div>
              <div className="min-w-0 flex-1 bg-slate-800/20 group-hover:bg-slate-800/40 p-3 -mt-3 rounded-xl transition-colors border border-transparent group-hover:border-white/5 group-hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-white font-medium leading-tight">
                    {event.title}
                  </p>
                  {event.badge && (
                    <span className={cn(
                      "text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 uppercase tracking-widest",
                      event.badge.cls,
                    )}>
                      {event.badge.label}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">{event.subtitle}</p>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">{event.time}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── #2: Today Focus / Action-First Header Block ───────────────────────────────

function TodayFocusBlock({
  role,
  projects,
  pendingTasks,
  awaitingPayment,
  isLoading,
}: {
  role: string;
  projects: Project[];
  pendingTasks: number;
  awaitingPayment: string;
  isLoading: boolean;
}) {
  const overdueProjects  = projects.filter((p) => daysUntil(p.deadline) !== null && (daysUntil(p.deadline) ?? 0) < 0);
  const stalledProjects  = projects.filter((p) => p.status === ProjectStatus.ON_HOLD);
  const hasPendingPay    = parseFloat(awaitingPayment || "0") > 0;

  const ctas: { label: string; sub: string; href: string; cls: string; urgent: boolean }[] = [];

  if (overdueProjects.length > 0) {
    ctas.push({
      label: `${overdueProjects.length} overdue project${overdueProjects.length > 1 ? "s" : ""}`,
      sub: "Require immediate attention",
      href: "/projects",
      cls: "ring-rose-500/40 hover:ring-rose-500/80 bg-rose-500/5 hover:bg-rose-500/10 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]",
      urgent: true,
    });
  }

  if (pendingTasks > 0) {
    ctas.push({
      label: `${pendingTasks} task${pendingTasks > 1 ? "s" : ""} on deck`,
      sub: role === "FREELANCER" ? "Assigned to you" : "Across all active projects",
      href: "/projects",
      cls: "ring-amber-500/40 hover:ring-amber-500/80 bg-amber-500/5 hover:bg-amber-500/10 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]",
      urgent: false,
    });
  }

  if (hasPendingPay && (role === "CLIENT" || role === "ADMIN")) {
    ctas.push({
      label: `${formatCurrency(awaitingPayment)} awaits`,
      sub: "Invoices ready for processing",
      href: "/invoices",
      cls: "ring-blue-500/40 hover:ring-blue-500/80 bg-blue-500/5 hover:bg-blue-500/10 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]",
      urgent: false,
    });
  }

  if (stalledProjects.length > 0) {
    ctas.push({
      label: `${stalledProjects.length} stalled project${stalledProjects.length > 1 ? "s" : ""}`,
      sub: "Pending decisions or hold",
      href: "/projects",
      cls: "ring-slate-600/60 hover:ring-slate-500 bg-slate-800/30 hover:bg-slate-800/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]",
      urgent: false,
    });
  }

  if (ctas.length === 0 || isLoading) return null;

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 rounded-3xl p-6 shadow-2xl shadow-black/50">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
        Today&apos;s Focus
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ctas.slice(0, 3).map((cta) => (
          <Link
            key={cta.label}
            href={cta.href}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl ring-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group",
              cta.cls,
            )}
          >
            {cta.urgent && (
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-white truncate transition-colors group-hover:text-white">{cta.label}</p>
              <p className="text-xs text-slate-400 mt-1 transition-colors group-hover:text-slate-300">{cta.sub}</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              <span className="text-white/70">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── #4: Project Row with Insight Line ────────────────────────────────────────

function ProjectRow({ project }: { project: Project }) {
  const statusStyle = STATUS_STYLES[project.status];
  const days        = daysUntil(project.deadline);
  const isOverdue   = days !== null && days < 0;
  const isDueSoon   = days !== null && days >= 0 && days <= 3;

  // Derive a one-line insight
  let insightText = "";
  let insightCls  = "text-slate-500";
  if (isOverdue) {
    insightText = "Deadline passed — action required";
    insightCls  = "text-rose-400 font-medium";
  } else if (project.status === ProjectStatus.ON_HOLD) {
    insightText = "Stalled — waiting for decision";
    insightCls  = "text-amber-400";
  } else if (isDueSoon) {
    insightText = `Due in ${days}d — final stretch`;
    insightCls  = "text-amber-300";
  } else if (project.status === ProjectStatus.COMPLETED) {
    insightText = "Completed successfully ✓";
    insightCls  = "text-emerald-400";
  } else if (project.status === ProjectStatus.IN_PROGRESS) {
    insightText = "Active runway · Moving forward";
    insightCls  = "text-blue-400";
  }

  return (
    <Link href={`/projects/${project.id}`} className="block">
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/40 ring-1 ring-white/5 hover:bg-slate-800/60 hover:ring-white/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 group">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-1.5 h-10 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.5)] group-hover:shadow-[0_0_12px_rgba(59,130,246,0.8)] transition-all" />
          <div className="min-w-0">
            <p className="text-base font-bold text-white truncate group-hover:text-blue-50 transition-colors">{project.title}</p>
            {insightText && (
              <p className={cn("text-xs truncate mt-1 flex items-center gap-1.5", insightCls)}>
                {insightText}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-6 shrink-0 ml-4">
          <span
            className={cn(
              "text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-widest hidden sm:block",
              statusStyle.className,
            )}
          >
            {statusStyle.label}
          </span>
          <div className="text-right">
            <p className="text-sm font-mono text-slate-200 font-medium">
              {formatCurrency(project.budget)}
            </p>
            <div className="mt-1 flex justify-end">
              <DeadlineBadge deadline={project.deadline} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

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
          {/* Active Projects */}
          <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 p-6 rounded-3xl flex flex-col justify-between group hover:bg-slate-900/80 hover:ring-white/10 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-blue-500/10 ring-1 ring-blue-500/20 rounded-xl text-blue-400 group-hover:scale-110 transition-transform duration-300">
                <NavProjectsIcon className="w-6 h-6" />
              </div>
              {!statsLoading && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  Active
                </span>
              )}
            </div>
            <div className="relative z-10 mt-4">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Active Projects</h3>
              <p className="text-3xl font-bold text-white mt-1 font-space-grotesk tracking-tight">
                {statsLoading ? (
                  <span className="inline-block w-8 h-8 rounded bg-slate-800 animate-pulse" />
                ) : (
                  statsData?.activeProjects ?? "—"
                )}
              </p>
            </div>
          </div>

          {/* Pending Tasks */}
          <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 p-6 rounded-3xl flex flex-col justify-between group hover:bg-slate-900/80 hover:ring-white/10 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-amber-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-amber-500/10 ring-1 ring-amber-500/20 rounded-xl text-amber-400 group-hover:scale-110 transition-transform duration-300">
                <NavTasksIcon className="w-6 h-6" />
              </div>
              {!statsLoading && (
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 ring-1 ring-amber-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {pendingTasks === 0 ? "All clear" : `${pendingTasks} open`}
                </span>
              )}
            </div>
            <div className="relative z-10 mt-4">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending Tasks</h3>
              <p className="text-3xl font-bold text-white mt-1 font-space-grotesk tracking-tight">
                {statsLoading ? (
                  <span className="inline-block w-8 h-8 rounded bg-slate-800 animate-pulse" />
                ) : (
                  pendingTasks
                )}
              </p>
            </div>
          </div>

          {/* Awaiting Payment */}
          <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 p-6 rounded-3xl flex flex-col justify-between group hover:bg-slate-900/80 hover:ring-white/10 transition-all hover:shadow-xl hover:-translate-y-1 duration-300 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-2xl rounded-full pointer-events-none group-hover:bg-rose-500/10 transition-colors" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2.5 bg-rose-500/10 ring-1 ring-rose-500/20 rounded-xl text-rose-400 group-hover:scale-110 transition-transform duration-300">
                <NavInvoicesIcon className="w-6 h-6" />
              </div>
              {!statsLoading && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 ring-1 ring-rose-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  {parseFloat(awaitingPayment) > 0 ? "Action needed" : "All clear"}
                </span>
              )}
            </div>
            <div className="relative z-10 mt-4">
              <h3 className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Awaiting Payment</h3>
              <p className="text-2xl font-bold text-white mt-1 font-mono tracking-tight">
                {statsLoading ? (
                  <span className="inline-block w-24 h-8 rounded bg-slate-800 animate-pulse" />
                ) : (
                  formatCurrency(awaitingPayment)
                )}
              </p>
            </div>
          </div>
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
