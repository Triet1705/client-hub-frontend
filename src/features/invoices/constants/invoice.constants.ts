import type { FilterPillOption } from "@/components/ui/filter-pills";
import type { ColumnOption } from "@/components/ui/change-column-table-popup";
import { InvoiceStatus, PaymentMethod, EscrowStatus } from "@/lib/type";

export type StatusFilterValue = "ALL" | InvoiceStatus;
export type MethodFilterValue = "ALL" | PaymentMethod;

export const INVOICE_STATUS_FILTERS: FilterPillOption<StatusFilterValue>[] = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: InvoiceStatus.DRAFT },
  { label: "Sent", value: InvoiceStatus.SENT },
  { label: "Locked", value: InvoiceStatus.LOCKED },
  { label: "Paid", value: InvoiceStatus.PAID },
  { label: "Overdue", value: InvoiceStatus.OVERDUE },
];

export const INVOICE_METHOD_FILTERS: FilterPillOption<MethodFilterValue>[] = [
  { label: "All", value: "ALL" },
  { label: "Fiat", value: PaymentMethod.FIAT },
  { label: "Crypto Escrow", value: PaymentMethod.CRYPTO_ESCROW },
  { label: "Crypto Direct", value: PaymentMethod.CRYPTO_DIRECT },
];

export const INVOICE_STATUS_FILTER_VALUES: StatusFilterValue[] = INVOICE_STATUS_FILTERS.map(
  (option) => option.value,
);

export const INVOICE_METHOD_FILTER_VALUES: MethodFilterValue[] = INVOICE_METHOD_FILTERS.map(
  (option) => option.value,
);

export const INVOICE_PAGE_SIZE = 10;

export const INVOICE_COLUMN_OPTIONS: ColumnOption[] = [
  { key: "invoice", label: "Invoice", locked: true },
  { key: "title", label: "Title" },
  { key: "amount", label: "Amount" },
  { key: "dueDate", label: "Due Date" },
  { key: "status", label: "Status" },
  { key: "payment", label: "Payment" },
  { key: "reference", label: "Reference" },
  { key: "action", label: "Action", locked: true },
];

export const DEFAULT_INVOICE_VISIBLE_COLUMNS: Record<string, boolean> = {
  invoice: true,
  title: true,
  amount: true,
  dueDate: true,
  status: true,
  payment: true,
  reference: false,
  action: true,
};

export function resolveInvoiceColumns(raw: string | null): Record<string, boolean> {
  if (!raw) return DEFAULT_INVOICE_VISIBLE_COLUMNS;

  const requestedKeys = new Set(raw.split(",").map((item) => item.trim()).filter(Boolean));
  const resolved: Record<string, boolean> = {};

  INVOICE_COLUMN_OPTIONS.forEach((column) => {
    resolved[column.key] = column.locked ? true : requestedKeys.has(column.key);
  });

  return resolved;
}

export const DEFAULT_INVOICE_VISIBLE_COLUMNS_QUERY = INVOICE_COLUMN_OPTIONS
  .filter((column) => DEFAULT_INVOICE_VISIBLE_COLUMNS[column.key])
  .map((column) => column.key)
  .join(",");

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: "Draft",
  [InvoiceStatus.SENT]: "Sent",
  [InvoiceStatus.CRYPTO_ESCROW_WAITING]: "Awaiting Deposit",
  [InvoiceStatus.DEPOSIT_DETECTED]: "Deposit Detected",
  [InvoiceStatus.LOCKED]: "Locked",
  [InvoiceStatus.DISPUTED]: "Disputed",
  [InvoiceStatus.PAID]: "Payment Released",
  [InvoiceStatus.REFUNDED]: "Refunded",
  [InvoiceStatus.OVERDUE]: "Overdue",
  [InvoiceStatus.EXPIRED]: "Expired",
};

export const INVOICE_STATUS_PILL_CLASS: Record<InvoiceStatus, string> = {
  [InvoiceStatus.DRAFT]: "bg-status-neutral-surface text-content-secondary border-content-muted/30",
  [InvoiceStatus.SENT]: "bg-status-info-surface text-status-info-text border-status-info-border",
  [InvoiceStatus.CRYPTO_ESCROW_WAITING]: "bg-status-warning-surface text-status-warning-text border-status-warning-border",
  [InvoiceStatus.DEPOSIT_DETECTED]: "bg-status-info-surface text-status-info-text border-status-info-border",
  [InvoiceStatus.LOCKED]: "bg-status-web3-surface text-status-web3-text border-status-web3-border",
  [InvoiceStatus.DISPUTED]: "bg-status-danger-surface text-status-danger-text border-status-danger-border",
  [InvoiceStatus.PAID]: "bg-action-subtle text-theme-accent border-theme-accent",
  [InvoiceStatus.REFUNDED]: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  [InvoiceStatus.OVERDUE]: "bg-status-danger-surface text-status-danger-text border-status-danger-border",
  [InvoiceStatus.EXPIRED]: "bg-status-warning-surface text-status-warning-text border-status-warning-border",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.FIAT]: "Bank Transfer",
  [PaymentMethod.CRYPTO_ESCROW]: "Crypto Escrow",
  [PaymentMethod.CRYPTO_DIRECT]: "Crypto Direct",
};

export const ESCROW_STATUS_LABELS: Record<EscrowStatus, string> = {
  [EscrowStatus.NOT_STARTED]: "Not Started",
  [EscrowStatus.DEPOSITED]: "Deposited",
  [EscrowStatus.RELEASED]: "Released",
  [EscrowStatus.REFUNDED]: "Refunded",
  [EscrowStatus.DISPUTED]: "Disputed",
};
