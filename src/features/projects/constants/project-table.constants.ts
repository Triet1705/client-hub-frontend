import type { ColumnOption } from "@/components/ui/change-column-table-popup";
import { ProjectStatus, type PaymentMethod } from "../types/project.types";

export type ProjectStatusFilterValue = ProjectStatus | "ALL";
export type ProjectPaymentFilterValue = PaymentMethod | "ALL";

export const PROJECT_STATUS_OPTIONS: Array<{ label: string; value: ProjectStatusFilterValue }> = [
  { label: "All", value: "ALL" },
  { label: "Planning", value: ProjectStatus.PLANNING },
  { label: "In Progress", value: ProjectStatus.IN_PROGRESS },
  { label: "On Hold", value: ProjectStatus.ON_HOLD },
  { label: "Completed", value: ProjectStatus.COMPLETED },
];

export const PROJECT_PAYMENT_OPTIONS: Array<{ label: string; value: ProjectPaymentFilterValue }> = [
  { label: "All", value: "ALL" },
  { label: "Fiat", value: "FIAT" },
  { label: "Crypto Escrow", value: "CRYPTO_ESCROW" },
  { label: "Crypto Direct", value: "CRYPTO_DIRECT" },
];

export const PROJECT_STATUS_FILTER_VALUES: ProjectStatusFilterValue[] = PROJECT_STATUS_OPTIONS.map(
  (option) => option.value,
);

export const PROJECT_PAYMENT_FILTER_VALUES: ProjectPaymentFilterValue[] = PROJECT_PAYMENT_OPTIONS.map(
  (option) => option.value,
);

export const PROJECT_STATUS_LABEL_MAP: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: "Planning",
  [ProjectStatus.IN_PROGRESS]: "In Progress",
  [ProjectStatus.ON_HOLD]: "On Hold",
  [ProjectStatus.COMPLETED]: "Completed",
  [ProjectStatus.CANCELLED]: "Cancelled",
};

export const PROJECT_COLUMN_OPTIONS: ColumnOption[] = [
  { key: "project", label: "Project", locked: true },
  { key: "budget", label: "Budget" },
  { key: "status", label: "Status" },
  { key: "payment", label: "Payment" },
  { key: "deadline", label: "Deadline" },
  { key: "actions", label: "Actions", locked: true },
];

export const DEFAULT_PROJECT_VISIBLE_COLUMNS: Record<string, boolean> = {
  project: true,
  budget: true,
  status: true,
  payment: true,
  deadline: true,
  actions: true,
};

export function resolveProjectColumns(raw: string | null): Record<string, boolean> {
  if (!raw) return DEFAULT_PROJECT_VISIBLE_COLUMNS;

  const requestedKeys = new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
  const resolved: Record<string, boolean> = {};

  PROJECT_COLUMN_OPTIONS.forEach((column) => {
    resolved[column.key] = column.locked ? true : requestedKeys.has(column.key);
  });

  return resolved;
}

export const DEFAULT_PROJECT_VISIBLE_COLUMNS_QUERY = PROJECT_COLUMN_OPTIONS
  .filter((column) => DEFAULT_PROJECT_VISIBLE_COLUMNS[column.key])
  .map((column) => column.key)
  .join(",");
