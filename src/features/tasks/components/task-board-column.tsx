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
        return "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30";
      case TaskStatus.DONE:
        return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
      case TaskStatus.CANCELED:
        return "from-rose-500/20 to-rose-500/5 border-rose-500/30";
      case TaskStatus.TODO:
      default:
        return "from-slate-600/20 to-slate-600/5 border-slate-500/30";
    }
  };

  const getTitleStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "text-emerald-400";
      case TaskStatus.DONE: return "text-blue-400";
      case TaskStatus.CANCELED: return "text-rose-300";
      case TaskStatus.TODO:
      default: return "text-slate-300";
    }
  };

  const getBadgeStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]";
      case TaskStatus.DONE: return "bg-blue-500/10 text-blue-400 ring-blue-500/30";
      case TaskStatus.CANCELED: return "bg-rose-500/10 text-rose-300 ring-rose-500/30";
      case TaskStatus.TODO:
      default: return "bg-slate-800 text-slate-400 ring-slate-700";
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
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 ring-1 ring-white/10 transition-all active:scale-95 shadow-inner"
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
              "flex-1 flex flex-col gap-4 overflow-y-auto rounded-3xl transition-all duration-300 custom-scrollbar p-2.5 bg-slate-900/50 ring-1 ring-white/10 shadow-[inset_0_2px_18px_rgba(0,0,0,0.2)] relative",
              snapshot.isDraggingOver && "bg-emerald-500/10 ring-emerald-500/35 shadow-[inset_0_0_30px_rgba(16,185,129,0.07)]"
            )}
          >
            {count === 0 && (
               <div className="absolute top-10 left-1/2 -translate-x-1/2 w-36 h-36 bg-slate-400/10 blur-3xl rounded-full pointer-events-none" />
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
                <div className="w-10 h-10 border border-dashed border-slate-500/70 rounded-2xl flex items-center justify-center bg-slate-900/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                </div>
                <p className="text-[11px] font-bold tracking-wide text-slate-400">No tasks</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Add a task or drag one here</p>
              </div>
            )}

            {count === 0 && snapshot.isDraggingOver && (
              <div className="mt-10 flex flex-col items-center justify-center gap-2 text-center">
                <p className="text-[10px] uppercase tracking-widest text-emerald-300">Release to move task</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}