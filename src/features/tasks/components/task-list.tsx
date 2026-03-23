import * as React from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "../types/task.types";
import { TaskPriorityBadge } from "./task-priority-badge";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {
  const getStatusDisplay = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return (
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
            Active
          </span>
        );
      case TaskStatus.DONE:
        return (
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-blue-500/10 border-blue-500/30 text-blue-400">
            Completed
          </span>
        );
      case TaskStatus.CANCELED:
        return (
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-rose-500/10 border-rose-500/30 text-rose-300">
            Cancelled
          </span>
        );
      case TaskStatus.TODO:
      default:
        return (
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border bg-[#161616] border-[#333333] text-slate-400">
            To Do
          </span>
        );
    }
  };

  if (!tasks.length) {
    return (
      <div className="border border-dashed border-white/10 rounded-xl p-12 text-center text-slate-500 bg-slate-900/40">
        No tasks found in this view.
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden mt-6">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-230 text-left">
          <thead className="border-b border-white/5 bg-slate-900/80">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {tasks.map((task) => {
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
                <tr
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    "group bg-slate-800/20 cursor-pointer ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-[1px] transition-all duration-300 hover:shadow-xl hover:z-10 relative",
                    isDone || isCancelled ? "opacity-65" : "hover:bg-slate-800/60"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <h3 className={cn(
                        "text-sm font-bold leading-snug group-hover:text-emerald-400 transition-colors",
                        isDone || isCancelled ? "text-slate-400 line-through" : "text-slate-200"
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-slate-500 font-medium line-clamp-1 max-w-md">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusDisplay(task.status)}
                  </td>
                  <td className="px-6 py-5">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-5">
                    <div 
                      className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300"
                      title={task.assignedTo?.email || "Unassigned"}
                    >
                      {task.assignedTo ? avatarInitials : "—"}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {(isDone || isCancelled) ? (
                      <span className="text-xs font-medium text-slate-500">
                        {isCancelled ? "Cancelled" : "Completed"}
                      </span>
                    ) : dateText ? (
                      <span className={cn("text-xs font-medium", isOverdue ? "text-rose-400" : "text-slate-500")}>
                        {dateText}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-600">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
