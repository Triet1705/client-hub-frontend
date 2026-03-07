import { cn } from "@/lib/utils";
import { ProjectStatus } from "../types/project.types";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const statusConfig: Record<ProjectStatus, { label: string; classes: string }> = {
    [ProjectStatus.PLANNING]: {
      label: "Planning",
      classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    },
    [ProjectStatus.IN_PROGRESS]: {
      label: "In Progress",
      classes: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    },
    [ProjectStatus.ON_HOLD]: {
      label: "On Hold",
      classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    },
    [ProjectStatus.COMPLETED]: {
      label: "Completed",
      classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    },
    [ProjectStatus.CANCELLED]: {
      label: "Cancelled",
      classes: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    },
  };

  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}