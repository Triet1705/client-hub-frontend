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
    [TaskStatus.TODO]: "bg-slate-800 text-slate-400 border-slate-700",
    [TaskStatus.IN_PROGRESS]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    [TaskStatus.DONE]: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    [TaskStatus.CANCELED]: "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <span
      className={cn(
        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
        statusBadgeClass[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
