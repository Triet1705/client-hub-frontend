import { cn } from "@/lib/utils";
import { ProjectStatus } from "../types/project.types";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  [ProjectStatus.PLANNING]:    { label: "Planning",    color: "text-content-secondary",   bg: "bg-status-neutral-surface border-content-muted/20",   dot: "bg-status-neutral-text"   },
  [ProjectStatus.IN_PROGRESS]: { label: "In Progress", color: "text-status-info-text",    bg: "bg-status-info-surface border-status-info-border",     dot: "bg-status-info-text"    },
  [ProjectStatus.ON_HOLD]:     { label: "On Hold",     color: "text-status-warning-text",   bg: "bg-status-warning-surface border-status-warning-border",   dot: "bg-status-warning-text"   },
  [ProjectStatus.COMPLETED]:   { label: "Completed",   color: "text-theme-accent", bg: "bg-action-subtle border-theme-accent", dot: "bg-status-success-text" },
  [ProjectStatus.CANCELLED]:   { label: "Cancelled",   color: "text-status-danger-text",    bg: "bg-status-danger-surface border-status-danger-border",     dot: "bg-status-danger-text"    },
};

export function ProjectStatusBadge({ status, className }: ProjectStatusBadgeProps) {
  const c = STATUS_CONFIG[status] ?? STATUS_CONFIG[ProjectStatus.PLANNING];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
        c.bg,
        c.color,
        className,
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", c.dot)} />
      {c.label}
    </span>
  );
}
