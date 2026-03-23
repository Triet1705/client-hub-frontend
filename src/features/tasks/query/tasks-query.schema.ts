import { TaskPriority } from "../types/task.types";

export type TasksViewMode = "kanban" | "list";
export type TaskPriorityFilterValue = TaskPriority | "ALL";

type QueryReader = {
  get: (key: string) => string | null;
};

export type TasksQueryState = {
  projectId?: string;
  viewMode: TasksViewMode;
  priorityFilter: TaskPriorityFilterValue;
  assigneeId?: string;
};

const VIEW_MODES: TasksViewMode[] = ["kanban", "list"];
const PRIORITY_FILTER_VALUES: TaskPriorityFilterValue[] = [
  "ALL",
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

export function parseTasksQuery(query: QueryReader): TasksQueryState {
  const projectId = query.get("projectId") || undefined;
  const rawView = query.get("view");
  const rawPriority = query.get("priority");
  const assigneeId = query.get("assignee") || undefined;

  const viewMode = VIEW_MODES.includes(rawView as TasksViewMode)
    ? (rawView as TasksViewMode)
    : "kanban";

  const priorityFilter = PRIORITY_FILTER_VALUES.includes(rawPriority as TaskPriorityFilterValue)
    ? (rawPriority as TaskPriorityFilterValue)
    : "ALL";

  return {
    projectId,
    viewMode,
    priorityFilter,
    assigneeId,
  };
}
