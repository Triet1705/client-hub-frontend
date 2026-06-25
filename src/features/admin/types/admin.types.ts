import type { Role } from "@/features/auth/types/auth.types";
import type { InvoiceStatus } from "@/lib/type";
import type { ProjectStatus } from "@/features/projects/types/project.types";

export interface PlatformStats {
  totalUsers: number;
  totalProjects: number;
  totalInvoices: number;
  totalRevenue: string; // BigInt as string
  systemHealth: string;
}

export interface ComponentHealth {
  status: "UP" | "DEGRADED" | "DOWN";
  label: string;
  latencyMs: number;
}

export interface AdminJvmVitals {
  usedMemoryMb: number;
  maxMemoryMb: number;
  freeMemoryMb: number;
  availableProcessors: number;
}

export interface AdminHealthResponse {
  overallStatus: "UP" | "DEGRADED" | "DOWN";
  database: ComponentHealth;
  redis: ComponentHealth;
  aiEngine: ComponentHealth;
  blockchain: ComponentHealth;
  jvm: AdminJvmVitals;
  uptimeSeconds: number;
  checkedAt: string;
}

export interface ControlCenterSummary {
  totalRevenue: string | number;
  activeUsers24h: number;
  openProjects: number;
  unpaidInvoices: number;
  systemStatus: "UP" | "DEGRADED" | "DOWN";
}

export type AdminAlertSeverity = "INFO" | "WARNING" | "CRITICAL";

export interface AdminAlert {
  id: string;
  severity: AdminAlertSeverity;
  title: string;
  message: string;
  recommendedAction: string;
  createdAt: string;
}

export type AdminEventCategory =
  | "AUTH"
  | "USER"
  | "PROJECT"
  | "TASK"
  | "INVOICE"
  | "AUDIT"
  | "SYSTEM"
  | "WEB3";

export type AdminEventSeverity = "INFO" | "SUCCESS" | "WARNING" | "CRITICAL";

export interface AdminEventItem {
  id: number;
  category: AdminEventCategory;
  severity: AdminEventSeverity;
  title: string;
  description: string;
  actorEmail: string | null;
  tenantId: string;
  entityType: string;
  entityId: string | null;
  occurredAt: string;
}

export interface AdminFeatureFlag {
  key: string;
  label: string;
  enabled: boolean;
  status: string;
  description: string;
  source: string;
}

export interface ControlCenterResponse {
  summary: ControlCenterSummary;
  health: AdminHealthResponse;
  alerts: AdminAlert[];
  recentEvents: AdminEventItem[];
  recentAuditLogs: AdminAuditLogResponse[];
  flags: AdminFeatureFlag[];
}

export interface AdminAuditLogResponse {
  id: number;
  action: string;
  entityType: string;
  entityId: string;
  userEmail: string | null;
  userRole: string | null;
  userId: string | null;
  tenantId: string;
  ipAddress: string;
  createdAt: string;
  oldValue: string | null;
  newValue: string | null;
  dataHash: string;
  isAnchored: boolean;
}

export interface AdminAuditLogFilters {
  page: number;
  size: number;
  action?: string;
  entityType?: string;
  tenantId?: string;
  anchored?: boolean;
  from?: string;
  to?: string;
}

export interface AdminEventFilters {
  page: number;
  size: number;
  category?: AdminEventCategory | "ALL";
  severity?: AdminEventSeverity | "ALL";
  entityType?: string;
  tenantId?: string;
  from?: string;
  to?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  role: Role;
  tenantId: string;
  active: boolean;
  walletAddress: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface AdminUserDetail extends AdminUser {
  projectCount: number;
  invoiceCount: number;
}

export interface AdminProject {
  id: string;
  title: string;
  status: ProjectStatus;
  tenantId: string;
  ownerEmail: string | null;
  ownerName: string | null;
  memberCount: number;
  taskCount: number;
  budget: string; // BigDecimal as string
  deadline: string | null;
  createdAt: string;
}

export interface AdminInvoice {
  id: number | string;
  amount: string; // BigInt as string
  status: InvoiceStatus;
  tenantId: string;
  projectTitle: string;
  createdByEmail: string | null;
  createdAt: string;
}

export interface ForceStatusRequest {
  status: InvoiceStatus;
  reason: string;
}

export interface ImpersonationResponse {
  accessToken: string;
  id: string;
  email: string;
  role: Role;
  tenantId: string;
  impersonated: boolean;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  empty: boolean;
}
