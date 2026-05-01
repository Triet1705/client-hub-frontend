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

  const [boardTasks, setBoardTasks] = React.useState<Task[]>(tasks);

  React.useEffect(() => {
    setBoardTasks(tasks);
  }, [tasks]);

  const todoTasks = boardTasks.filter((t) => t.status === TaskStatus.TODO);
  const inProgressTasks = boardTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS);
  const doneTasks = boardTasks.filter((t) => t.status === TaskStatus.DONE);
  const canceledTasks = boardTasks.filter((t) => t.status === TaskStatus.CANCELED);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const sourceStatus = source.droppableId as TaskStatus;
    const destinationStatus = destination.droppableId as TaskStatus;

    setBoardTasks((prev) => {
      const byStatus: Record<TaskStatus, Task[]> = {
        [TaskStatus.TODO]: prev.filter((t) => t.status === TaskStatus.TODO),
        [TaskStatus.IN_PROGRESS]: prev.filter((t) => t.status === TaskStatus.IN_PROGRESS),
        [TaskStatus.DONE]: prev.filter((t) => t.status === TaskStatus.DONE),
        [TaskStatus.CANCELED]: prev.filter((t) => t.status === TaskStatus.CANCELED),
      };

      const sourceColumn = [...byStatus[sourceStatus]];
      const [movedTask] = sourceColumn.splice(source.index, 1);

      if (!movedTask) {
        return prev;
      }

      const destinationColumn =
        sourceStatus === destinationStatus
          ? sourceColumn
          : [...byStatus[destinationStatus]];

      const movedWithUpdatedStatus =
        sourceStatus === destinationStatus
          ? movedTask
          : { ...movedTask, status: destinationStatus };

      destinationColumn.splice(destination.index, 0, movedWithUpdatedStatus);

      byStatus[sourceStatus] = sourceColumn;
      byStatus[destinationStatus] = destinationColumn;

      return [
        ...byStatus[TaskStatus.TODO],
        ...byStatus[TaskStatus.IN_PROGRESS],
        ...byStatus[TaskStatus.DONE],
        ...byStatus[TaskStatus.CANCELED],
      ];
    });

    if (sourceStatus !== destinationStatus) {
      updateStatus({ id: draggableId, status: destinationStatus });
    }
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
            status={TaskStatus.CANCELED}
            tasks={canceledTasks}
            onAddTask={onAddTask}
            onTaskClick={onTaskClick}
          />
        </div>
      </DragDropContext>
    </div>
  );
}