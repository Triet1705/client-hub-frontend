import type { FilterPillOption } from "@/components/ui/filter-pills";
import type { ColumnOption } from "@/components/ui/change-column-table-popup";
import { InvoiceStatus, PaymentMethod } from "@/lib/type";

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
  reference: true,
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
  [InvoiceStatus.DRAFT]: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  [InvoiceStatus.SENT]: "bg-blue-500/10 text-blue-300 border-blue-500/30",
  [InvoiceStatus.CRYPTO_ESCROW_WAITING]: "bg-amber-500/10 text-amber-300 border-amber-500/30",
  [InvoiceStatus.DEPOSIT_DETECTED]: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
  [InvoiceStatus.LOCKED]: "bg-violet-500/10 text-violet-300 border-violet-500/30",
  [InvoiceStatus.DISPUTED]: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  [InvoiceStatus.PAID]: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
  [InvoiceStatus.REFUNDED]: "bg-fuchsia-500/10 text-fuchsia-300 border-fuchsia-500/30",
  [InvoiceStatus.OVERDUE]: "bg-red-500/10 text-red-300 border-red-500/30",
  [InvoiceStatus.EXPIRED]: "bg-orange-500/10 text-orange-300 border-orange-500/30",
};
