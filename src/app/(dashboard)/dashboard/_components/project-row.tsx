import * as React from "react";
import Link from "next/link";
import { cn, formatFiat as formatCurrency } from "@/lib/utils";
import { Project, ProjectStatus } from "@/features/projects/types/project.types";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/features/projects/constants/project-ui.constants";
import { daysUntil, DeadlineBadge } from "./deadline-badge";

export function ProjectRow({ project }: { project: Project }) {
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
              PROJECT_STATUS_BADGE[project.status],
            )}
          >
            {PROJECT_STATUS_LABEL[project.status]}
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
