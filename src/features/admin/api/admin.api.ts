import { apiClient } from "@/lib/axios";
import type { Role } from "@/features/auth/types/auth.types";
import type {
  PlatformStats,
  AdminUser,
  AdminUserDetail,
  AdminProject,
  AdminInvoice,
  AdminHealthResponse,
  AdminAuditLogResponse,
  AdminAuditLogFilters,
  AdminEventFilters,
  AdminEventItem,
  AdminFeatureFlag,
  ControlCenterResponse,
  ForceStatusRequest,
  ImpersonationResponse,
  PageResponse,
} from "../types/admin.types";

export async function fetchPlatformStats(): Promise<PlatformStats> {
  const { data } = await apiClient.get<PlatformStats>("/admin/analytics");
  return data;
}

export async function fetchSystemHealth(): Promise<AdminHealthResponse> {
  const { data } = await apiClient.get<AdminHealthResponse>("/admin/health");
  return data;
}

export async function fetchControlCenter(): Promise<ControlCenterResponse> {
  const { data } = await apiClient.get<ControlCenterResponse>("/admin/control-center");
  return data;
}

export async function fetchAdminAuditLogs(params: AdminAuditLogFilters): Promise<PageResponse<AdminAuditLogResponse>> {
  const { data } = await apiClient.get<PageResponse<AdminAuditLogResponse>>("/admin/audit-logs", { params });
  return data;
}

export async function fetchAdminEvents(params: AdminEventFilters): Promise<PageResponse<AdminEventItem>> {
  const { category, severity, ...rest } = params;
  const requestParams = {
    ...rest,
    ...(category && category !== "ALL" ? { category } : {}),
    ...(severity && severity !== "ALL" ? { severity } : {}),
  };
  const { data } = await apiClient.get<PageResponse<AdminEventItem>>("/admin/events", { params: requestParams });
  return data;
}

export async function fetchAdminFlags(): Promise<AdminFeatureFlag[]> {
  const { data } = await apiClient.get<AdminFeatureFlag[]>("/admin/flags");
  return data;
}

export async function fetchAdminUsers(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  role?: Role;
  active?: boolean;
  keyword?: string;
}): Promise<PageResponse<AdminUser>> {
  const { data } = await apiClient.get<PageResponse<AdminUser>>("/admin/users", { params });
  return data;
}

export async function fetchAdminUserDetail(id: string): Promise<AdminUserDetail> {
  const { data } = await apiClient.get<AdminUserDetail>(`/admin/users/${id}`);
  return data;
}

export async function updateUserStatus(id: string, active: boolean): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/status`, { active });
}

export async function updateUserRole(id: string, role: Role): Promise<void> {
  await apiClient.patch(`/admin/users/${id}/role`, { role });
}

export async function fetchAdminProjects(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}): Promise<PageResponse<AdminProject>> {
  const { data } = await apiClient.get<PageResponse<AdminProject>>("/admin/projects", { params });
  return data;
}

export async function fetchAdminInvoices(params: {
  page: number;
  size: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}): Promise<PageResponse<AdminInvoice>> {
  const { data } = await apiClient.get<PageResponse<AdminInvoice>>("/admin/invoices", { params });
  return data;
}

export async function forceInvoiceStatus(id: number | string, req: ForceStatusRequest): Promise<void> {
  await apiClient.patch(`/admin/invoices/${id}/force-status`, req);
}

export async function impersonateUser(userId: string): Promise<ImpersonationResponse> {
  const { data } = await apiClient.post<ImpersonationResponse>(`/admin/impersonate/${userId}`);
  return data;
}
