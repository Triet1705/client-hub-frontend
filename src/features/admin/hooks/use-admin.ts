import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchPlatformStats,
  fetchAdminUsers,
  fetchAdminUserDetail,
  updateUserStatus,
  updateUserRole,
  fetchAdminProjects,
  fetchAdminInvoices,
  forceInvoiceStatus,
  impersonateUser,
  fetchSystemHealth,
  fetchAdminAuditLogs,
  fetchControlCenter,
  fetchAdminEvents,
  fetchAdminFlags,
} from "../api/admin.api";
import type { Role } from "@/features/auth/types/auth.types";
import type { AdminAuditLogFilters, AdminEventFilters, ForceStatusRequest } from "../types/admin.types";

export const adminKeys = {
  all: ["admin"] as const,
  stats: () => [...adminKeys.all, "stats"] as const,
  users: (params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
    role?: Role;
    active?: boolean;
    keyword?: string;
  }) => [...adminKeys.all, "users", params] as const,
  userDetail: (id: string) => [...adminKeys.all, "user", id] as const,
  projects: (params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) => [...adminKeys.all, "projects", params] as const,
  invoices: (params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDir?: "asc" | "desc";
  }) => [...adminKeys.all, "invoices", params] as const,
  health: () => [...adminKeys.all, "health"] as const,
  controlCenter: () => [...adminKeys.all, "control-center"] as const,
  auditLogs: (params: AdminAuditLogFilters) =>
    [...adminKeys.all, "audit-logs", params] as const,
  events: (params: AdminEventFilters) => [...adminKeys.all, "events", params] as const,
  flags: () => [...adminKeys.all, "flags"] as const,
};

export function usePlatformStatsQuery() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: fetchPlatformStats,
  });
}

export function useSystemHealthQuery() {
  return useQuery({
    queryKey: adminKeys.health(),
    queryFn: fetchSystemHealth,
    refetchInterval: 30000, // Poll every 30s
  });
}

export function useControlCenterQuery() {
  return useQuery({
    queryKey: adminKeys.controlCenter(),
    queryFn: fetchControlCenter,
    refetchInterval: 30000,
  });
}

export function useAdminAuditLogsQuery(params: AdminAuditLogFilters) {
  return useQuery({
    queryKey: adminKeys.auditLogs(params),
    queryFn: () => fetchAdminAuditLogs(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminEventsQuery(params: AdminEventFilters) {
  return useQuery({
    queryKey: adminKeys.events(params),
    queryFn: () => fetchAdminEvents(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminFlagsQuery() {
  return useQuery({
    queryKey: adminKeys.flags(),
    queryFn: fetchAdminFlags,
    refetchInterval: 30000,
  });
}

export function useAdminUsersQuery(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  role?: Role;
  active?: boolean;
  keyword?: string;
}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => fetchAdminUsers(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminUserDetailQuery(id: string) {
  return useQuery({
    queryKey: adminKeys.userDetail(id),
    queryFn: () => fetchAdminUserDetail(id),
    enabled: !!id,
  });
}

export function useUpdateUserStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      updateUserStatus(id, active),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUpdateUserRoleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      updateUserRole(id, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.userDetail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useAdminProjectsQuery(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: adminKeys.projects(params),
    queryFn: () => fetchAdminProjects(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminInvoicesQuery(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: adminKeys.invoices(params),
    queryFn: () => fetchAdminInvoices(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useForceInvoiceStatusMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, req }: { id: number | string; req: ForceStatusRequest }) =>
      forceInvoiceStatus(id, req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
    },
  });
}

export function useImpersonateMutation() {
  return useMutation({
    mutationFn: impersonateUser,
  });
}
