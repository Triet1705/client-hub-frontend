import { cn } from "@/lib/utils";
import { TaskStatus } from "../types/task.types";
import { STATUS_LABELS } from "./task-status-badge";

interface TaskStatusSelectorProps {
  activeStatus: TaskStatus;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
  className?: string;
}

export function TaskStatusSelector({
  activeStatus,
  onStatusChange,
  disabled = false,
  className,
}: TaskStatusSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      {(Object.values(TaskStatus) as TaskStatus[]).map((s) => (
        <button
          type="button"
          key={s}
          disabled={disabled}
          onClick={() => onStatusChange(s)}
          className={cn(
            "px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
            activeStatus === s
              ? "border-theme-accent bg-action-subtle text-theme-accent"
              : "border-theme-border text-content-muted hover:border-theme-border hover:text-content-secondary",
            disabled && "opacity-50 cursor-not-allowed hover:border-theme-border hover:text-content-muted"
          )}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
    </div>
  );
}
