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
    [TaskStatus.CANCELED]: "bg-rose-500/10 text-rose-300 border-rose-500/30",
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
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
      )}
      {status === TaskStatus.IN_PROGRESS ? "Active" : STATUS_LABELS[status]}
    </span>
  );
}
