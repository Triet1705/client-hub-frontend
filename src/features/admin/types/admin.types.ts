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

export interface AdminHealthResponse {
  overallStatus: "UP" | "DEGRADED" | "DOWN";
  database: ComponentHealth;
  redis: ComponentHealth;
  aiEngine: ComponentHealth;
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
