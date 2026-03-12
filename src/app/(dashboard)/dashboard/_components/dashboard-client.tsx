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
  if (days === null) return <span className="text-slate-500 text-xs">No deadline</span>;
  if (days < 0)
    return (
      <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full">
        Overdue
      </span>
    );
  if (days <= 3)
    return (
      <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
        In {days}d
      </span>
    );
  return (
    <span className="text-xs font-medium text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded-full">
      In {days}d
    </span>
  );
}

const STATUS_STYLES: Record<ProjectStatus, { label: string; className: string }> = {
  [ProjectStatus.PLANNING]: {
    label: "Planning",
    className: "text-slate-300 bg-slate-700/50 border-slate-600/30",
  },
  [ProjectStatus.IN_PROGRESS]: {
    label: "In Progress",
    className: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  },
  [ProjectStatus.ON_HOLD]: {
    label: "On Hold",
    className: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  },
  [ProjectStatus.COMPLETED]: {
    label: "Completed",
    className: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  },
  [ProjectStatus.CANCELLED]: {
    label: "Cancelled",
    className: "text-rose-400 bg-rose-400/10 border-rose-400/20",
  },
};


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
    <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Task Overview</h2>
        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400">Completion</span>
          <span className="text-xs font-bold text-emerald-400">{completionRate}%</span>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-end gap-1.5 h-16 px-1">
          {isLoading
            ? [1, 2, 3].map((i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className="w-full flex items-end h-12">
                    <div className="w-full rounded-t bg-slate-800 animate-pulse" style={{ height: "60%" }} />
                  </div>
                  <span className="text-[10px] text-slate-500">&nbsp;</span>
                </div>
              ))
            : bars.map((item) => {
                const heightPct = Math.max(12, (item.count / maxCount) * 100);
                return (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col items-center gap-1.5"
                  >
                    <div className="w-full flex items-end h-12">
                      <div
                        className={cn(
                          "w-full rounded-t transition-all duration-700",
                          item.color,
                        )}
                        style={{ height: `${heightPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{item.label}</span>
                  </div>
                );
              })}
        </div>
      </div>

      <div className="space-y-2.5">
        {bars.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn("w-2 h-2 rounded-full", item.color)} />
              <span className="text-xs text-slate-400">{item.label}</span>
            </div>
            {isLoading ? (
              <div className="w-4 h-3 rounded bg-slate-800 animate-pulse" />
            ) : (
              <span className="text-xs font-bold text-white">{item.count}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// TODO: Replace with real audit log API (GET /api/audit-logs?limit=3)

const BLOCKCHAIN_EVENTS = [
  {
    id: 1,
    icon: "📋",
    title: "Invoice INV-001 Issued",
    subtitle: "FIAT • $2,500.00 • Phase 1",
    time: "4 days ago",
    dot: "bg-blue-500",
  },
  {
    id: 2,
    icon: "🗂️",
    title: "Project Created",
    subtitle: "Mobile App Redesign • tenant: default",
    time: "4 days ago",
    dot: "bg-emerald-500",
  },
  {
    id: 3,
    icon: "👤",
    title: "Demo Accounts Provisioned",
    subtitle: "Admin · Freelancer · Client",
    time: "4 days ago",
    dot: "bg-slate-400",
  },
];

function ProjectRow({ project }: { project: Project }) {
  const statusStyle = STATUS_STYLES[project.status];
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-1.5 h-8 bg-blue-500 rounded-full shrink-0" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">{project.title}</p>
          <p className="text-[11px] text-slate-500 truncate">{project.ownerName}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0 ml-4">
        <span
          className={cn(
            "text-[10px] font-bold px-2 py-1 rounded border uppercase tracking-wide",
            statusStyle.className,
          )}
        >
          {statusStyle.label}
        </span>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-mono text-slate-300">
            {formatCurrency(project.budget)}
          </p>
          <DeadlineBadge deadline={project.deadline} />
        </div>
      </div>
    </div>
  );
}

export function DashboardClient() {
  const { data: projectsData, isLoading: projectsLoading } = useProjectsQuery(0, 5);
  const { data: statsData,    isLoading: statsLoading    } = useDashboardStatsQuery();
  const { data: taskSummary,  isLoading: taskSummaryLoading } = useTaskSummaryQuery();
  const { user } = useAuthStore();
  const canCreate = user?.role === "CLIENT" || user?.role === "ADMIN";

  const recentProjects = projectsData?.content ?? [];

  return (
    <div className="space-y-8">
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
          {canCreate && (
            <Link
              href="/projects"
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-900/20"
            >
              <ActionPlusIcon className="w-4 h-4" />
              Create Project
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <NavProjectsIcon className="w-6 h-6" />
            </div>
            {!projectsLoading && (
              <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">Active Projects</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {statsLoading ? (
                <span className="inline-block w-8 h-8 rounded bg-slate-800 animate-pulse" />
              ) : (
                statsData?.activeProjects ?? "—"
              )}
            </p>
          </div>
        </div>

        {/* Pending Tasks — real data from GET /api/tasks/summary */}
        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <NavTasksIcon className="w-6 h-6" />
            </div>
            {!statsLoading && (
              <span className="text-xs font-medium text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">
                {(statsData?.pendingTasks ?? 0) === 0 ? "All clear" : `${statsData?.pendingTasks} open`}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">Pending Tasks</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {statsLoading ? (
                <span className="inline-block w-8 h-8 rounded bg-slate-800 animate-pulse" />
              ) : (
                statsData?.pendingTasks ?? "—"
              )}
            </p>
          </div>
        </div>

        <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 p-6 rounded-2xl flex flex-col justify-between group hover:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 group-hover:bg-rose-500/20 transition-colors">
              <NavInvoicesIcon className="w-6 h-6" />
            </div>
            {!statsLoading && (
              <span className="text-xs font-medium text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
                {parseFloat(statsData?.awaitingPaymentAmount ?? "0") > 0 ? "Action needed" : "All clear"}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-slate-400 text-sm font-medium">Awaiting Payment</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {statsLoading ? (
                <span className="inline-block w-24 h-8 rounded bg-slate-800 animate-pulse" />
              ) : (
                formatCurrency(statsData?.awaitingPaymentAmount)
              )}
            </p>
          </div>
        </div>

        {/* Escrow Locked — 0 until M3 Web3 integration */}
        <div className="rainbow-border relative bg-[#020617] p-6 rounded-2xl flex flex-col justify-between shadow-lg">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <BlockchainPendingIcon className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold ml-1">
                On-Chain
              </span>
            </div>
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-400 text-sm font-medium">Escrow Locked (USDT)</h3>
            <p className="text-3xl font-bold text-white mt-1">
              {formatCurrency(statsData?.escrowLocked ?? "0")}
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
                className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                View All →
              </Link>
            </div>

            {projectsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 w-full animate-pulse rounded-xl bg-slate-800/50"
                  />
                ))}
              </div>
            ) : recentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-slate-800 rounded-xl">
                <NavProjectsIcon className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">No projects found.</p>
                <p className="text-slate-500 text-sm mt-1">
                  Create a new project to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <ProjectRow key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <TaskOverviewChart taskSummary={taskSummary} isLoading={taskSummaryLoading} />

          <div className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white">Blockchain Activity</h2>
              <Link
                href="/audit-logs"
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View All →
              </Link>
            </div>

            <div className="space-y-4">
              {BLOCKCHAIN_EVENTS.map((event) => (
                <div key={event.id} className="flex gap-3 items-start">
                  <div className="mt-1 shrink-0">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full ring-4 ring-opacity-20",
                        event.dot,
                        event.dot.replace("bg-", "ring-"),
                      )}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium leading-tight">
                      {event.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{event.subtitle}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5 font-mono">
                      {event.time}
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
