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
  [TaskPriority.URGENT]: { dot: "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse", text: "text-rose-400", bg: "bg-rose-500/10 ring-rose-500/20" },
  [TaskPriority.HIGH]:   { dot: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]", text: "text-amber-400", bg: "bg-amber-500/10 ring-amber-500/20" },
  [TaskPriority.MEDIUM]: { dot: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]", text: "text-blue-400", bg: "bg-blue-500/10 ring-blue-500/20" },
  [TaskPriority.LOW]:    { dot: "bg-slate-500", text: "text-slate-400", bg: "bg-slate-500/10 ring-slate-500/20" },
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
        "group bg-slate-900/60 backdrop-blur-xl rounded-2xl p-4 cursor-pointer flex flex-col gap-4 relative transition-all duration-300 ring-1",
        isDone || isCancelled
          ? "opacity-60 ring-transparent bg-slate-900/40"
          : "ring-white/5 hover:ring-white/15 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50 hover:bg-slate-800/80 z-0",
        isInProgress && "ring-emerald-500/30 hover:ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.05)]",
        isCancelled && "cursor-default drop-shadow-none"
      )}
    >
      {isInProgress && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-50 rounded-t-2xl" />
      )}

      <div className="flex gap-3">
        <div 
          className="shrink-0 w-8 h-8 rounded-full bg-slate-800 ring-2 ring-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-300 shadow-inner z-10"
          title={task.assignedTo?.email || "Unassigned"}
        >
          {task.assignedTo ? avatarInitials : "-"}
        </div>
        <div className="min-w-0 flex-1 pt-1">
          <h3 className={cn(
            "text-sm font-bold leading-snug tracking-tight",
            isDone || isCancelled ? "text-slate-500 line-through" : "text-slate-200 group-hover:text-white transition-colors"
          )}>
            {task.title}
          </h3>
        </div>
      </div>

      {task.description && (
        <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2 px-1">
          {task.description}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 mt-1">
        
        <div className="bg-slate-950/40 rounded-xl p-2.5 ring-1 ring-white/5 flex items-center justify-center gap-2 shadow-inner">
          <div className="relative flex items-center justify-center w-3 h-3 shrink-0">
             <span className={cn("absolute w-full h-full rounded-full opacity-20", priorityStyle.bg)} />
             <span className={cn("w-1.5 h-1.5 rounded-full", priorityStyle.dot)} />
          </div>
          <span className={cn("text-[9px] font-bold uppercase tracking-widest", priorityStyle.text)}>
             {task.priority}
          </span>
          {task.estimatedHours != null && (
            <>
              <span className="w-px h-2.5 bg-slate-700 block" />
              <span className="text-[10px] font-mono text-slate-400">{task.estimatedHours}h</span>
            </>
          )}
        </div>

        <div className={cn(
          "rounded-xl p-2.5 ring-1 flex items-center justify-center gap-1.5 shadow-inner",
          isDone ? "bg-blue-500/5 ring-blue-500/10" :
          isCancelled ? "bg-rose-500/5 ring-rose-500/10" :
          isOverdue ? "bg-rose-500/10 ring-rose-500/20" :
          isInProgress ? "bg-emerald-500/10 ring-emerald-500/20" :
          "bg-slate-950/40 ring-white/5"
        )}>
          {(isDone || isCancelled) ? (
            <span className={cn("text-[9px] font-bold uppercase tracking-widest", isCancelled ? "text-rose-400" : "text-blue-400")}>
              {isCancelled ? "Cancelled" : "Completed"}
            </span>
          ) : dateText ? (
            <>
              <Clock className={cn("w-3 h-3", isOverdue ? "text-rose-400" : "text-slate-500")} />
              <span className={cn("text-[10px] font-medium tracking-wide", isOverdue ? "text-rose-400" : "text-slate-400")}>
                {dateText}
              </span>
            </>
          ) : (
            <span className="text-[10px] text-slate-600 font-medium">No Date</span>
          )}
        </div>

      </div>
    </div>
  );
}