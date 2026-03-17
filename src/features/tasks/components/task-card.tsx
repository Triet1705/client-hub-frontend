import * as React from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "../types/task.types";
import { TaskPriorityBadge } from "./task-priority-badge";

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const isDone = task.status === TaskStatus.DONE;
  const isCancelled = task.status === TaskStatus.CANCELED;

  let dateText: string | null = null;
  let isOverdue = false;
  if (task.dueDate) {
    const dateObj = new Date(task.dueDate);
    isOverdue = isPast(dateObj) && !isDone && !isCancelled;
    dateText = isOverdue ? "Overdue" : `Due ${formatDistanceToNow(dateObj, { addSuffix: true })}`;
  }

  const avatarInitials = task.assignedTo?.email?.substring(0, 2).toUpperCase() ?? "?";

  return (
    <div
      onClick={() => onClick?.(task)}
      className={cn(
        "group bg-slate-900/85 rounded-lg p-3.5 cursor-pointer flex flex-col gap-3 relative transition-all border",
        isDone || isCancelled
          ? "opacity-65 border-slate-800"
          : "border-slate-800 hover:border-emerald-500/70 hover:bg-slate-900",
        task.status === TaskStatus.IN_PROGRESS && "border-emerald-500/50",
        isCancelled && "cursor-default"
      )}
    >
      {task.status === TaskStatus.IN_PROGRESS && (
        <div className="flex justify-between items-start">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <h3 className={cn(
          "text-sm font-medium leading-snug",
          isDone || isCancelled ? "text-slate-400 line-through" : "text-slate-200"
        )}>
          {task.title}
        </h3>
        {task.description && (
          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3 mt-1">
        <div 
          className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[9px] font-bold text-slate-300"
          title={task.assignedTo?.email || "Unassigned"}
        >
          {task.assignedTo ? avatarInitials : "—"}
        </div>

        <div className="flex items-center gap-2">
          {task.estimatedHours != null && (
            <span className="text-[10px] text-slate-500 font-mono">~{task.estimatedHours}h</span>
          )}
          <TaskPriorityBadge priority={task.priority} />
          {(isDone || isCancelled) ? (
            <span className="text-[10px] font-medium text-slate-500">
              {isCancelled ? "Cancelled" : "Completed"}
            </span>
          ) : dateText ? (
            <span className={cn("text-[10px] font-medium", isOverdue ? "text-red-400" : "text-slate-500")}>
              {dateText}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}