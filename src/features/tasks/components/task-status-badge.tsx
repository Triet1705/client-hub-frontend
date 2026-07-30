import { cn } from "@/lib/utils";
import { TaskStatus } from "../types/task.types";

export const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]: "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]: "Done",
  [TaskStatus.CANCELED]: "Cancelled",
};

interface TaskStatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const statusBadgeClass = {
    [TaskStatus.TODO]: "bg-surface-elevated text-content-secondary border-theme-border",
    [TaskStatus.IN_PROGRESS]: "bg-action-subtle text-theme-accent border-theme-accent",
    [TaskStatus.DONE]: "bg-status-info-surface text-status-info-text border-status-info-border",
    [TaskStatus.CANCELED]: "bg-status-danger-surface text-status-danger-text border-status-danger-border",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border",
        statusBadgeClass[status],
        className
      )}
    >
      {status === TaskStatus.IN_PROGRESS && (
        <span className="w-1.5 h-1.5 rounded-full bg-status-success-text animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      )}
      {status === TaskStatus.IN_PROGRESS ? "Active" : STATUS_LABELS[status]}
    </span>
  );
}
