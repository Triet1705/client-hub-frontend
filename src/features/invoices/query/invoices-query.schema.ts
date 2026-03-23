import { resolveEnumFromQuery, resolveTextFromQuery } from "@/lib/url-query";
import {
  INVOICE_METHOD_FILTER_VALUES,
  INVOICE_STATUS_FILTER_VALUES,
  resolveInvoiceColumns,
  type MethodFilterValue,
  type StatusFilterValue,
} from "../constants/invoice.constants";

type QueryReader = {
  get: (key: string) => string | null;
};

export type InvoicesQueryState = {
  statusFilter: StatusFilterValue;
  methodFilter: MethodFilterValue;
  keyword: string;
  page: number;
  visibleColumns: Record<string, boolean>;
};

export function parseInvoicesQuery(
  query: QueryReader,
  fallbackColumns: Record<string, boolean>,
): InvoicesQueryState {
  const statusFilter = resolveEnumFromQuery<StatusFilterValue>(
    query.get("status"),
    INVOICE_STATUS_FILTER_VALUES,
    "ALL",
  );

  const methodFilter = resolveEnumFromQuery<MethodFilterValue>(
    query.get("method"),
    INVOICE_METHOD_FILTER_VALUES,
    "ALL",
  );

  const keyword = resolveTextFromQuery(query.get("q"));

  const rawPage = Number(query.get("page") ?? "1");
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage - 1 : 0;

  const colsParam = query.get("cols");
  const visibleColumns = colsParam
    ? resolveInvoiceColumns(colsParam)
    : fallbackColumns;

  return {
    statusFilter,
    methodFilter,
    keyword,
    page,
    visibleColumns,
  };
}
