import * as React from "react";
import { formatDistanceToNow, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "../types/task.types";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskStatusBadge } from "./task-status-badge";
import { UserAvatar } from "@/components/ui/user-avatar";

interface TaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export function TaskList({ tasks, onTaskClick }: TaskListProps) {


  if (!tasks.length) {
    return (
      <div className="border border-dashed border-theme-border rounded-xl p-12 text-center text-content-muted bg-surface/40">
        No tasks found in this view.
      </div>
    );
  }

  return (
    <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 rounded-3xl overflow-hidden mt-6">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-230 text-left">
          <thead className="border-b border-theme-border bg-surface/80">
            <tr>
              <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Task Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Priority</th>
              <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Assignee</th>
              <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Deadline</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
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



              return (
                <tr
                  key={task.id}
                  onClick={() => onTaskClick?.(task)}
                  className={cn(
                    "group bg-surface-elevated/20 cursor-pointer ring-1 ring-transparent hover:ring-theme-border hover:-translate-y-[1px] transition-all duration-300 hover:shadow-xl hover:z-10 relative",
                    isDone || isCancelled ? "opacity-65" : "hover:bg-surface-elevated/60"
                  )}
                >
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <h3 className={cn(
                        "text-sm font-bold leading-snug group-hover:text-theme-accent transition-colors",
                        isDone || isCancelled ? "text-content-secondary line-through" : "text-content-secondary"
                      )}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-xs text-content-muted font-medium line-clamp-1 max-w-md">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <TaskStatusBadge status={task.status} />
                  </td>
                  <td className="px-6 py-5">
                    <TaskPriorityBadge priority={task.priority} />
                  </td>
                  <td className="px-6 py-5">
                    {task.assignedTo ? (
                      <UserAvatar
                        name={task.assignedTo.fullName || task.assignedTo.email}
                        sizeClass="w-8 h-8 text-[10px]"
                        className="bg-surface-elevated border border-theme-border text-content-secondary"
                      />
                    ) : (
                      <span className="text-xs text-content-muted">—</span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    {(isDone || isCancelled) ? (
                      <span className="text-xs font-medium text-content-muted">
                        {isCancelled ? "Cancelled" : "Completed"}
                      </span>
                    ) : dateText ? (
                      <span className={cn("text-xs font-medium", isOverdue ? "text-status-danger-text" : "text-content-muted")}>
                        {dateText}
                      </span>
                    ) : (
                      <span className="text-xs text-content-muted">—</span>
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
