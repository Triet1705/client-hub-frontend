import { apiClient } from "@/lib/axios";
import type { Task, TaskRequestPayload, FetchTasksParams, TaskPageResponse, TaskStatus } from "../types/task.types";

const TASKS_BASE = "/tasks";

function normalizeDueDate(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  // Backend expects LocalDateTime; expand date-only values from date inputs.
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return `${trimmed}T00:00:00`;
  }

  return trimmed;
}

function normalizeTaskPayload(payload: TaskRequestPayload): TaskRequestPayload {
  return {
    ...payload,
    dueDate: normalizeDueDate(payload.dueDate),
  };
}

export async function fetchTasks(params: FetchTasksParams): Promise<TaskPageResponse> {
  const { data } = await apiClient.get<TaskPageResponse>(TASKS_BASE, { params });
  return data;
}

export async function fetchTaskById(id: string): Promise<Task> {
  const { data } = await apiClient.get<Task>(`${TASKS_BASE}/${id}`);
  return data;
}

export async function createTask(payload: TaskRequestPayload): Promise<Task> {
  const { data } = await apiClient.post<Task>(TASKS_BASE, normalizeTaskPayload(payload));
  return data;
}

export async function updateTask(id: string, payload: TaskRequestPayload): Promise<Task> {
  const { data } = await apiClient.put<Task>(`${TASKS_BASE}/${id}`, normalizeTaskPayload(payload));
  return data;
}

export async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const { data } = await apiClient.patch<Task>(
    `${TASKS_BASE}/${id}/status`, 
    null, 
    { params: { status } } 
  );
  return data;
}

export async function assignTask(id: string, userId: string): Promise<Task> {
  const { data } = await apiClient.patch<Task>(
    `${TASKS_BASE}/${id}/assign`, 
    null, 
    { params: { userId } }
  );
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await apiClient.delete(`${TASKS_BASE}/${id}`);
}