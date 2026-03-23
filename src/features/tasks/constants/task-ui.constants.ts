import type { SelectOption } from "@/components/ui/select-dropdown";
import { TaskPriority, TaskStatus } from "@/features/tasks/types/task.types";

export const TASK_PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { value: TaskPriority.LOW, label: "Low" },
  { value: TaskPriority.MEDIUM, label: "Medium" },
  { value: TaskPriority.HIGH, label: "High" },
  { value: TaskPriority.URGENT, label: "Urgent" },
];

export const TASK_STATUS_OPTIONS: SelectOption<TaskStatus>[] = [
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELED, label: "Canceled" },
];