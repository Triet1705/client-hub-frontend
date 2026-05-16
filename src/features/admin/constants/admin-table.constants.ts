import type { Role } from "@/features/auth/types/auth.types";
import { InvoiceStatus } from "@/lib/type";
import { ProjectStatus } from "@/features/projects/types/project.types";

export type AdminUserStatusFilterValue = "ALL" | "ACTIVE" | "INACTIVE";
export type AdminUserRoleFilterValue = "ALL" | Role;

export const ADMIN_USER_STATUS_OPTIONS: { label: string; value: AdminUserStatusFilterValue; count?: number }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
];

export const ADMIN_USER_ROLE_OPTIONS: { label: string; value: AdminUserRoleFilterValue; count?: number }[] = [
  { label: "All Roles", value: "ALL" },
  { label: "Client", value: "CLIENT" },
  { label: "Freelancer", value: "FREELANCER" },
  { label: "Admin", value: "ADMIN" },
];

export type AdminProjectStatusFilterValue = "ALL" | ProjectStatus;

export const ADMIN_PROJECT_STATUS_OPTIONS: { label: string; value: AdminProjectStatusFilterValue; count?: number }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Planning", value: ProjectStatus.PLANNING },
  { label: "In Progress", value: ProjectStatus.IN_PROGRESS },
  { label: "On Hold", value: ProjectStatus.ON_HOLD },
  { label: "Completed", value: ProjectStatus.COMPLETED },
  { label: "Cancelled", value: ProjectStatus.CANCELLED },
];

export type AdminInvoiceStatusFilterValue = "ALL" | InvoiceStatus;

export const ADMIN_INVOICE_STATUS_OPTIONS: { label: string; value: AdminInvoiceStatusFilterValue; count?: number }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Draft", value: InvoiceStatus.DRAFT },
  { label: "Sent", value: InvoiceStatus.SENT },
  { label: "Locked", value: InvoiceStatus.LOCKED },
  { label: "Paid", value: InvoiceStatus.PAID },
  { label: "Overdue", value: InvoiceStatus.OVERDUE },
  { label: "Refunded", value: InvoiceStatus.REFUNDED },
];

export const ADMIN_PAGE_SIZE = 10;
