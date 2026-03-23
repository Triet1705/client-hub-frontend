import { resolveEnumFromQuery, resolveTextFromQuery } from "@/lib/url-query";
import {
  PROJECT_PAYMENT_FILTER_VALUES,
  PROJECT_STATUS_FILTER_VALUES,
  resolveProjectColumns,
  type ProjectPaymentFilterValue,
  type ProjectStatusFilterValue,
} from "../constants/project-table.constants";

type QueryReader = {
  get: (key: string) => string | null;
};

export type ProjectsQueryState = {
  statusFilter: ProjectStatusFilterValue;
  paymentFilter: ProjectPaymentFilterValue;
  keyword: string;
  visibleColumns: Record<string, boolean>;
};

export function parseProjectsQuery(
  query: QueryReader,
  fallbackColumns: Record<string, boolean>,
): ProjectsQueryState {
  const statusFilter = resolveEnumFromQuery<ProjectStatusFilterValue>(
    query.get("status"),
    PROJECT_STATUS_FILTER_VALUES,
    "ALL",
  );

  const paymentFilter = resolveEnumFromQuery<ProjectPaymentFilterValue>(
    query.get("payment"),
    PROJECT_PAYMENT_FILTER_VALUES,
    "ALL",
  );

  const keyword = resolveTextFromQuery(query.get("q"));

  const colsParam = query.get("cols");
  const visibleColumns = colsParam
    ? resolveProjectColumns(colsParam)
    : fallbackColumns;

  return {
    statusFilter,
    paymentFilter,
    keyword,
    visibleColumns,
  };
}
