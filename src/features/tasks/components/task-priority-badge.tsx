import { cn } from "@/lib/utils";
import { TaskPriority } from "../types/task.types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const config: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    [TaskPriority.LOW]: { bg: "bg-slate-800", text: "text-slate-400", border: "border-transparent" },
    [TaskPriority.MEDIUM]: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
    [TaskPriority.HIGH]: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20" },
    [TaskPriority.URGENT]: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  };

  const c = config[priority] || config[TaskPriority.LOW];

  return (
    <span 
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-medium tracking-wider uppercase border",
        c.bg, c.text, c.border,
        className
      )}
    >
      {priority}
    </span>
  );
}