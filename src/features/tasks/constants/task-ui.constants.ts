import { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";

export const TASK_PRIORITY_OPTIONS = [
  { value: TaskPriority.LOW, label: "Low" },
  { value: TaskPriority.MEDIUM, label: "Medium" },
  { value: TaskPriority.HIGH, label: "High" },
  { value: TaskPriority.URGENT, label: "Urgent" },
];

export const TASK_STATUS_OPTIONS = [
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELED, label: "Canceled" },
];

export const TASK_STATUS_BADGE: Record<TaskStatus, string> = {
  [TaskStatus.TODO]:        "bg-slate-500/10 text-slate-400 ring-slate-500/20 shadow-slate-500/10",
  [TaskStatus.IN_PROGRESS]: "bg-amber-500/10 text-amber-400 ring-amber-500/20 shadow-amber-500/10",
  [TaskStatus.DONE]:        "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20 shadow-emerald-500/10",
  [TaskStatus.CANCELED]:    "bg-rose-500/10 text-rose-400 ring-rose-500/20 shadow-rose-500/10",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]:        "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]:        "Done",
  [TaskStatus.CANCELED]:    "Canceled",
};