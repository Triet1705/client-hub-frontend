import { Task, TaskStatus } from "@/features/tasks/types/task.types";
import { TaskDueFilterValue } from "@/features/tasks/query/tasks-query.schema";

export type AdvancedFilters = {
  keyword: string;
  statuses: TaskStatus[];
  minEstimate: string;
  maxEstimate: string;
};

export const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  keyword: "",
  statuses: [],
  minEstimate: "",
  maxEstimate: "",
};

export function isTaskMatchingDueFilter(task: Task, dueFilter: TaskDueFilterValue): boolean {
  if (dueFilter === "ALL") {
    return true;
  }

  if (!task.dueDate) {
    return dueFilter === "NO_DUE_DATE";
  }

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfThisWeek = new Date(startOfToday);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);

  if (dueFilter === "OVERDUE") {
    return dueDate < startOfToday && task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELED;
  }

  if (dueFilter === "TODAY") {
    return dueDate >= startOfToday && dueDate < startOfTomorrow;
  }

  if (dueFilter === "THIS_WEEK") {
    return dueDate >= startOfToday && dueDate < endOfThisWeek;
  }

  return false;
}

export function isTaskMatchingAdvancedFilters(task: Task, filters: AdvancedFilters): boolean {
  const keyword = filters.keyword.trim().toLowerCase();
  if (keyword) {
    const searchable = [
      task.title,
      task.description ?? "",
      task.projectTitle,
      task.assignedTo?.fullName ?? "",
      task.assignedTo?.email ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (!searchable.includes(keyword)) {
      return false;
    }
  }

  if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
    return false;
  }

  const minEstimate = filters.minEstimate.trim() === "" ? undefined : Number(filters.minEstimate);
  const maxEstimate = filters.maxEstimate.trim() === "" ? undefined : Number(filters.maxEstimate);

  if ((minEstimate !== undefined && Number.isNaN(minEstimate)) || (maxEstimate !== undefined && Number.isNaN(maxEstimate))) {
    return false;
  }

  if (minEstimate !== undefined || maxEstimate !== undefined) {
    if (typeof task.estimatedHours !== "number") {
      return false;
    }
    if (minEstimate !== undefined && task.estimatedHours < minEstimate) {
      return false;
    }
    if (maxEstimate !== undefined && task.estimatedHours > maxEstimate) {
      return false;
    }
  }

  return true;
}
