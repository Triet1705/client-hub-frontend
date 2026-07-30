import { cn } from "@/lib/utils";
import { TaskPriority } from "../types/task.types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  const config: Record<TaskPriority, { bg: string; text: string; border: string }> = {
    [TaskPriority.LOW]: { bg: "bg-surface-elevated", text: "text-content-secondary", border: "border-transparent" },
    [TaskPriority.MEDIUM]: { bg: "bg-status-info-surface", text: "text-status-info-text", border: "border-status-info-border" },
    [TaskPriority.HIGH]: { bg: "bg-status-warning-surface", text: "text-status-warning-text", border: "border-status-warning-border" },
    [TaskPriority.URGENT]: { bg: "bg-status-danger-surface", text: "text-status-danger-text", border: "border-status-danger-border" },
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