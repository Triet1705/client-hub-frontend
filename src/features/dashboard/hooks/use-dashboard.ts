import { useQuery } from "@tanstack/react-query";
import { fetchDashboardStats, fetchTaskSummary } from "../api/dashboard.api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
  taskSummary: () => [...dashboardKeys.all, "task-summary"] as const,
};

export function useDashboardStatsQuery() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: fetchDashboardStats,
    refetchInterval: 60_000,
  });
}

export function useTaskSummaryQuery() {
  return useQuery({
    queryKey: dashboardKeys.taskSummary(),
    queryFn: fetchTaskSummary,
    refetchInterval: 60_000,
  });
}