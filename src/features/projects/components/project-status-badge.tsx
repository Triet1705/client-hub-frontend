import { cn } from "@/lib/utils";
import { ProjectStatus } from "../types/project.types";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: string; color: string; bg: string; dot: string }> = {
  [ProjectStatus.PLANNING]:    { label: "Planning",    color: "text-slate-400",   bg: "bg-slate-500/10 border-slate-500/20",   dot: "bg-slate-400"   },
  [ProjectStatus.IN_PROGRESS]: { label: "In Progress", color: "text-blue-400",    bg: "bg-blue-500/10 border-blue-400/20",     dot: "bg-blue-400"    },
  [ProjectStatus.ON_HOLD]:     { label: "On Hold",     color: "text-amber-400",   bg: "bg-amber-500/10 border-amber-400/20",   dot: "bg-amber-400"   },
  [ProjectStatus.COMPLETED]:   { label: "Completed",   color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/20", dot: "bg-emerald-400" },
  [ProjectStatus.CANCELLED]:   { label: "Cancelled",   color: "text-rose-400",    bg: "bg-rose-500/10 border-rose-400/20",     dot: "bg-rose-400"    },
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
