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
  [TaskStatus.TODO]:        "bg-status-neutral-surface text-content-secondary ring-status-neutral-border shadow-transparent",
  [TaskStatus.IN_PROGRESS]: "bg-status-warning-surface text-status-warning-text ring-status-warning-border shadow-amber-500/10",
  [TaskStatus.DONE]:        "bg-action-subtle text-theme-accent ring-theme-accent shadow-emerald-500/10",
  [TaskStatus.CANCELED]:    "bg-status-danger-surface text-status-danger-text ring-status-danger-border shadow-rose-500/10",
};

export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  [TaskStatus.TODO]:        "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]:        "Done",
  [TaskStatus.CANCELED]:    "Canceled",
};