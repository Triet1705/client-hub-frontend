import * as React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskStatus } from "../types/task.types";
import { TaskCard } from "./task-card";
import { Droppable, Draggable } from "@hello-pangea/dnd";

interface TaskBoardColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onAddTask?: (status: TaskStatus) => void;
}

export function TaskBoardColumn({ title, status, tasks, onTaskClick, onAddTask }: TaskBoardColumnProps) {
  const count = tasks.length;

  const getHeaderGradient = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return "from-action-subtle to-transparent border-theme-accent";
      case TaskStatus.DONE:
        return "from-status-info-surface to-transparent border-status-info-border";
      case TaskStatus.CANCELED:
        return "from-status-danger-surface to-transparent border-status-danger-border";
      case TaskStatus.TODO:
      default:
        return "from-status-neutral-surface to-transparent border-content-muted/30";
    }
  };

  const getTitleStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "text-theme-accent";
      case TaskStatus.DONE: return "text-status-info-text";
      case TaskStatus.CANCELED: return "text-status-danger-text";
      case TaskStatus.TODO:
      default: return "text-content-secondary";
    }
  };

  const getBadgeStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "bg-action-subtle text-theme-accent ring-theme-accent shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      case TaskStatus.DONE: return "bg-status-info-surface text-status-info-text ring-status-info-border";
      case TaskStatus.CANCELED: return "bg-status-danger-surface text-status-danger-text ring-status-danger-border";
      case TaskStatus.TODO:
      default: return "bg-surface-elevated text-content-secondary ring-theme-border";
    }
  };

  return (
    <div className="w-80 flex flex-col gap-4 h-full shrink-0 group/col relative">
      <div className={cn(
        "flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-br ring-1 ring-inset shadow-lg backdrop-blur-sm transition-all drop-shadow-sm",
        getHeaderGradient()
      )}>
        <div className="flex items-center gap-3">
          <span className={cn("text-[11px] font-space-grotesk font-bold uppercase tracking-widest drop-shadow", getTitleStyle())}>{title}</span>
          <span className={cn("px-2 py-0.5 rounded-lg ring-1 text-[10px] font-mono font-bold", getBadgeStyle())}>
            {count}
          </span>
        </div>

        {onAddTask && status !== TaskStatus.CANCELED && (
          <button
            onClick={() => onAddTask(status)}
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-surface-sunken text-content-secondary hover:text-content-primary hover:bg-surface-sunken ring-1 ring-theme-border transition-all active:scale-95 shadow-inner"
            title="Add task"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 flex flex-col gap-4 overflow-y-auto rounded-3xl transition-all duration-300 custom-scrollbar p-2.5 bg-surface/50 ring-1 ring-theme-border shadow-[inset_0_2px_18px_rgba(0,0,0,0.2)] relative",
              snapshot.isDraggingOver && "bg-action-subtle ring-theme-accent shadow-[inset_0_0_30px_rgba(16,185,129,0.07)]"
            )}
          >
            {count === 0 && (
               <div className="absolute top-10 left-1/2 -translate-x-1/2 w-36 h-36 bg-status-neutral-surface blur-3xl rounded-full pointer-events-none" />
            )}

            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="relative z-10"
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.9 : 1,
                    }}
                  >
                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {count === 0 && !snapshot.isDraggingOver && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2.5 text-center opacity-65">
                <div className="w-10 h-10 border border-dashed border-content-muted/70 rounded-2xl flex items-center justify-center bg-surface/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-neutral-text" />
                </div>
                <p className="text-[11px] font-bold tracking-wide text-content-secondary">No tasks</p>
                <p className="text-[10px] uppercase tracking-widest text-content-muted">Add a task or drag one here</p>
              </div>
            )}

            {count === 0 && snapshot.isDraggingOver && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-theme-accent">Release to move task</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}