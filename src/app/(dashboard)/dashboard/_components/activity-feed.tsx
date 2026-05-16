import * as React from "react";
import { cn, formatFiat as formatCurrency } from "@/lib/utils";
import { Project, ProjectStatus } from "@/features/projects/types/project.types";
import { PROJECT_STATUS_LABEL } from "@/features/projects/constants/project-ui.constants";
import { daysUntil } from "./deadline-badge";

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
      subtitle: `Project · ${PROJECT_STATUS_LABEL[p.status]}`,
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

export function ActivityFeed({
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
