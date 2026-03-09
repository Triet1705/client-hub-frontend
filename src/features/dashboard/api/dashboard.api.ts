import { apiClient } from "@/lib/axios";
import type { DashboardStats, TaskSummary } from "../types/dashboard.types";

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const { data } = await apiClient.get<DashboardStats>("/dashboard/summary");
  return data;
}

export async function fetchTaskSummary(): Promise<TaskSummary> {
  const { data } = await apiClient.get<TaskSummary>("/tasks/summary");
  return data;
}