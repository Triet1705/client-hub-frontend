import { TaskPriority, TaskStatus } from "../types/task.types";

export type TasksViewMode = "kanban" | "list";
export type TaskPriorityFilterValue = TaskPriority | "ALL";
export type TaskStatusFilterValue = TaskStatus | "ALL";
export type TaskDueFilterValue = "ALL" | "OVERDUE" | "TODAY" | "THIS_WEEK" | "NO_DUE_DATE";

type QueryReader = {
  get: (key: string) => string | null;
};

export type TasksQueryState = {
  projectId?: string;
  viewMode: TasksViewMode;
  priorityFilter: TaskPriorityFilterValue;
  statusFilter: TaskStatusFilterValue;
  dueFilter: TaskDueFilterValue;
  assigneeId?: string;
  keyword: string;
  advancedStatuses: TaskStatus[];
  estimateMin: string;
  estimateMax: string;
};

const VIEW_MODES: TasksViewMode[] = ["kanban", "list"];
const PRIORITY_FILTER_VALUES: TaskPriorityFilterValue[] = [
  "ALL",
  TaskPriority.LOW,
  TaskPriority.MEDIUM,
  TaskPriority.HIGH,
  TaskPriority.URGENT,
];

const STATUS_FILTER_VALUES: TaskStatusFilterValue[] = [
  "ALL",
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.DONE,
  TaskStatus.CANCELED,
];

const DUE_FILTER_VALUES: TaskDueFilterValue[] = [
  "ALL",
  "OVERDUE",
  "TODAY",
  "THIS_WEEK",
  "NO_DUE_DATE",
];

export function parseTasksQuery(query: QueryReader): TasksQueryState {
  const projectId = query.get("projectId") || undefined;
  const rawView = query.get("view");
  const rawPriority = query.get("priority");
  const rawStatus = query.get("status");
  const rawDue = query.get("due");
  const assigneeId = query.get("assignee") || undefined;
  const keyword = query.get("keyword")?.trim() ?? "";
  const estimateMin = query.get("estimateMin") ?? "";
  const estimateMax = query.get("estimateMax") ?? "";
  const rawAdvancedStatuses = query.get("statuses");

  const viewMode = VIEW_MODES.includes(rawView as TasksViewMode)
    ? (rawView as TasksViewMode)
    : "kanban";

  const priorityFilter = PRIORITY_FILTER_VALUES.includes(rawPriority as TaskPriorityFilterValue)
    ? (rawPriority as TaskPriorityFilterValue)
    : "ALL";

  const statusFilter = STATUS_FILTER_VALUES.includes(rawStatus as TaskStatusFilterValue)
    ? (rawStatus as TaskStatusFilterValue)
    : "ALL";

  const dueFilter = DUE_FILTER_VALUES.includes(rawDue as TaskDueFilterValue)
    ? (rawDue as TaskDueFilterValue)
    : "ALL";

  const advancedStatuses = (rawAdvancedStatuses ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter((item): item is TaskStatus => STATUS_FILTER_VALUES.includes(item as TaskStatus) && item !== "ALL");

  return {
    projectId,
    viewMode,
    priorityFilter,
    statusFilter,
    dueFilter,
    assigneeId,
    keyword,
    advancedStatuses,
    estimateMin,
    estimateMax,
  };
}
