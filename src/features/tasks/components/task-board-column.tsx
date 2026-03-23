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

  const getHeaderStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        return "border-emerald-500 shadow-[0_0_20px_-5px_rgba(16,185,129,0.2)]";
      case TaskStatus.DONE:
        return "border-blue-500";
      case TaskStatus.CANCELED:
        return "border-rose-500/40";
      case TaskStatus.TODO:
      default:
        return "border-slate-500/70";
    }
  };

  const getTitleStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "text-white";
      case TaskStatus.DONE: return "text-blue-400";
      case TaskStatus.CANCELED: return "text-rose-300";
      case TaskStatus.TODO:
      default: return "text-slate-300";
    }
  };

  const getBadgeStyle = () => {
    switch (status) {
      case TaskStatus.IN_PROGRESS: return "bg-emerald-500/20 border-emerald-500/40 text-emerald-500";
      case TaskStatus.DONE: return "bg-blue-500/10 border-blue-500/30 text-blue-400";
      case TaskStatus.CANCELED: return "bg-rose-500/10 border-rose-500/30 text-rose-300";
      case TaskStatus.TODO:
      default: return "bg-[#161616] border-[#333333] text-slate-400";
    }
  };

  return (
    <div className="w-72 flex flex-col gap-3 h-full shrink-0">
      <div className={cn("flex items-center justify-between px-1 pb-2 border-b-2", getHeaderStyle())}>
        <div className="flex items-center gap-2">
          <span className={cn("text-sm font-semibold", getTitleStyle())}>{title}</span>
          <span className={cn("px-1.5 py-0.5 rounded border text-[10px] font-mono", getBadgeStyle())}>
            {count}
          </span>
        </div>

        {onAddTask && status !== TaskStatus.CANCELED && (
          <button
            onClick={() => onAddTask(status)}
            className="text-slate-500 hover:text-white transition-colors"
            title="Add task"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      <Droppable droppableId={status}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 flex flex-col gap-3 overflow-y-auto pb-4 rounded-xl transition-colors no-scrollbar p-1.5 bg-slate-900/40 ring-1 ring-white/5 mt-2",
              snapshot.isDraggingOver && "bg-emerald-500/10 ring-emerald-500/30"
            )}
          >
            {tasks.map((task, index) => (
              <Draggable key={task.id} draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    style={{
                      ...provided.draggableProps.style,
                      opacity: snapshot.isDragging ? 0.85 : 1,
                    }}
                  >
                    <TaskCard key={task.id} task={task} onClick={onTaskClick} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {count === 0 && !snapshot.isDraggingOver && (
              <div className="border border-dashed border-[#333333] rounded-md p-4 text-center text-slate-600 text-xs">
                No tasks
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}