"use client";

import * as React from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Task, TaskStatus, FetchTasksParams } from "../types/task.types";
import { TaskBoardColumn } from "./task-board-column";
import { useUpdateTaskStatusMutation } from "../hooks/use-tasks";

interface TaskBoardProps {
  tasks: Task[];
  currentParams: FetchTasksParams;
  onAddTask?: (status: TaskStatus) => void;
  onTaskClick?: (task: Task) => void;
}

export function TaskBoard({ tasks, currentParams, onAddTask, onTaskClick }: TaskBoardProps) {
  const { mutate: updateStatus } = useUpdateTaskStatusMutation(currentParams);

  const todoTasks = tasks.filter((t) => t.status === TaskStatus.TODO);
  const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const doneTasks = tasks.filter((t) => t.status === TaskStatus.DONE);
  const cancelledTasks = tasks.filter((t) => t.status === TaskStatus.CANCELLED);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId as TaskStatus;
    updateStatus({ id: draggableId, status: newStatus });
  };

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 custom-scrollbar">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex h-full gap-5 min-w-max items-start pr-2">
          <TaskBoardColumn
            title="To Do"
            status={TaskStatus.TODO}
            tasks={todoTasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
          <TaskBoardColumn
            title="In Progress"
            status={TaskStatus.IN_PROGRESS}
            tasks={inProgressTasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
          <TaskBoardColumn
            title="Done"
            status={TaskStatus.DONE}
            tasks={doneTasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
          <TaskBoardColumn
            title="Cancelled"
            status={TaskStatus.CANCELLED}
            tasks={cancelledTasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        </div>
      </DragDropContext>
    </div>
  );
}