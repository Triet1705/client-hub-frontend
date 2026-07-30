import * as React from "react";
import Link from "next/link";
import { cn, formatFiat as formatCurrency } from "@/lib/utils";
import { Project, ProjectStatus } from "@/features/projects/types/project.types";
import { daysUntil } from "./deadline-badge";

export function TodayFocusBlock({
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
      cls: "ring-status-danger-border hover:ring-status-danger-border bg-status-danger-surface hover:bg-status-danger-surface shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]",
      urgent: true,
    });
  }

  if (pendingTasks > 0) {
    ctas.push({
      label: `${pendingTasks} task${pendingTasks > 1 ? "s" : ""} on deck`,
      sub: role === "FREELANCER" ? "Assigned to you" : "Across all active projects",
      href: "/projects",
      cls: "ring-status-warning-border hover:ring-status-warning-border bg-status-warning-surface hover:bg-status-warning-surface shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]",
      urgent: false,
    });
  }

  if (hasPendingPay && (role === "CLIENT" || role === "ADMIN")) {
    ctas.push({
      label: `${formatCurrency(awaitingPayment)} awaits`,
      sub: "Invoices ready for processing",
      href: "/invoices",
      cls: "ring-status-info-border hover:ring-status-info-border bg-status-info-surface hover:bg-status-info-surface shadow-[inset_0_0_20px_rgba(59,130,246,0.05)]",
      urgent: false,
    });
  }

  if (stalledProjects.length > 0) {
    ctas.push({
      label: `${stalledProjects.length} stalled project${stalledProjects.length > 1 ? "s" : ""}`,
      sub: "Pending decisions or hold",
      href: "/projects",
      cls: "ring-theme-border/60 hover:ring-theme-border bg-surface-elevated/30 hover:bg-surface-elevated/50 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]",
      urgent: false,
    });
  }

  if (ctas.length === 0 || isLoading) return null;

  return (
    <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border rounded-3xl p-6 shadow-2xl shadow-black/50">
      <p className="text-[11px] font-bold uppercase tracking-widest text-content-muted mb-4 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-status-success-text shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
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
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-danger-text opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-status-danger-text" />
              </span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-bold text-content-primary truncate transition-colors group-hover:text-content-primary">{cta.label}</p>
              <p className="text-xs text-content-secondary mt-1 transition-colors group-hover:text-content-secondary">{cta.sub}</p>
            </div>
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
              <span className="text-content-primary/70">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
