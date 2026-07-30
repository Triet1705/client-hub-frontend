import * as React from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority } from "../types/task.types";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const PRIORITY_STYLES: Record<TaskPriority, { dot: string; text: string; bg: string }> = {
  [TaskPriority.URGENT]: { dot: "bg-status-danger-text shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse", text: "text-status-danger-text", bg: "bg-status-danger-surface ring-status-danger-border" },
  [TaskPriority.HIGH]:   { dot: "bg-status-warning-text shadow-[0_0_8px_rgba(245,158,11,0.8)]", text: "text-status-warning-text", bg: "bg-status-warning-surface ring-status-warning-border" },
  [TaskPriority.MEDIUM]: { dot: "bg-status-info-text shadow-[0_0_8px_rgba(59,130,246,0.8)]", text: "text-status-info-text", bg: "bg-status-info-surface ring-status-info-border" },
  [TaskPriority.LOW]:    { dot: "bg-status-neutral-text", text: "text-content-secondary", bg: "bg-status-neutral-surface ring-status-neutral-border" },
};

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isDone = task.status === TaskStatus.DONE;
  const isCancelled = task.status === TaskStatus.CANCELED;
  const isInProgress = task.status === TaskStatus.IN_PROGRESS;

  let dateText: string | null = null;
  let isOverdue = false;
  if (task.dueDate) {
    const dateObj = new Date(task.dueDate);
    isOverdue = isPast(dateObj) && !isDone && !isCancelled;
    dateText = isOverdue ? "Overdue" : `Due ${formatDistanceToNow(dateObj, { addSuffix: true })}`;
  }

  const avatarInitials = task.assignedTo?.email?.substring(0, 2).toUpperCase() ?? "?";
  const priorityStyle = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES[TaskPriority.MEDIUM];

  return (
    <div
      onClick={() => onClick?.(task)}
      className={cn(
        "group bg-surface/60 backdrop-blur-xl rounded-2xl p-4 cursor-pointer flex flex-col gap-4 relative transition-all duration-300 ring-1",
        isDone || isCancelled
          ? "opacity-60 ring-transparent bg-surface/40"
          : "ring-theme-border hover:ring-theme-border hover:-translate-y-1 hover:shadow-xl hover:shadow-theme hover:bg-surface-elevated/80 z-0",
        isInProgress && "ring-theme-accent hover:ring-theme-accent shadow-[0_0_15px_rgba(16,185,129,0.05)]",
        isCancelled && "cursor-default drop-shadow-none"
      )}
    >
      {isInProgress && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-action-subtle via-theme-accent/50 to-transparent opacity-50 rounded-t-2xl" />
      )}

      <div className="flex gap-3">
        <div
          className="shrink-0 w-8 h-8 rounded-full bg-surface-elevated ring-2 ring-theme-border flex items-center justify-center text-[10px] font-bold text-content-secondary shadow-inner z-10"
          title={task.assignedTo?.email || "Unassigned"}
        >
          {task.assignedTo ? avatarInitials : "-"}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className={cn(
            "text-sm font-bold leading-snug tracking-tight",
            isDone || isCancelled ? "text-content-muted line-through" : "text-content-secondary group-hover:text-content-primary transition-colors"
          )}>
            {task.title}
          </h3>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-content-muted leading-relaxed line-clamp-2 px-1">
          {task.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-1">

        <div className="bg-surface-base/40 rounded-xl p-2.5 ring-1 ring-theme-border flex items-center justify-center gap-2 shadow-inner">
          <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
             <span className={cn("absolute w-full h-full rounded-full opacity-20", priorityStyle.bg)} />
             <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
          </div>
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", priorityStyle.text)}>
             {task.priority}
          </span>
          {task.estimatedHours != null && (
            <>
              <span className="w-px h-2.5 bg-surface-sunken block" />
              <span className="text-[10px] font-mono text-content-secondary">{task.estimatedHours}h</span>
            </>
          )}
        </div>

        <div className={cn(
          "rounded-xl p-2.5 ring-1 flex items-center justify-center gap-1.5 shadow-inner",
          isDone ? "bg-status-info-surface ring-status-info-border" :
          isCancelled ? "bg-status-danger-surface ring-status-danger-border" :
          isOverdue ? "bg-status-danger-surface ring-status-danger-border" :
          isInProgress ? "bg-action-subtle ring-theme-accent" :
          "bg-surface-base/40 ring-theme-border"
        )}>
          {(isDone || isCancelled) ? (
            <span className={cn("text-[9px] font-bold uppercase tracking-widest", isCancelled ? "text-status-danger-text" : "text-status-info-text")}>
              {isCancelled ? "Cancelled" : "Completed"}
            </span>
          ) : dateText ? (
            <>
              <Clock className={cn("w-3 h-3", isOverdue ? "text-status-danger-text" : "text-content-muted")} />
              <span className={cn("text-[10px] font-medium tracking-wide", isOverdue ? "text-status-danger-text" : "text-content-secondary")}>
                {dateText}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-content-muted font-medium">No Date</span>
          )}
        </div>

      </div>
    </div>
  );
}
