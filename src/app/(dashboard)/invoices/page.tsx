"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, CircleDot, Search, ShieldCheck } from "lucide-react";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { FilterSection } from "@/components/ui/filter-section";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { readTableVisibleColumns, writeTableVisibleColumns } from "@/lib/table-preferences";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { useInvoicesQuery, useUpdateInvoiceStatusMutation } from "@/features/invoices/hooks/use-invoices";
import { parseInvoicesQuery } from "@/features/invoices/query/invoices-query.schema";
import {
  DEFAULT_INVOICE_VISIBLE_COLUMNS,
  DEFAULT_INVOICE_VISIBLE_COLUMNS_QUERY,
  INVOICE_COLUMN_OPTIONS,
  INVOICE_METHOD_FILTERS,
  INVOICE_PAGE_SIZE,
  INVOICE_STATUS_FILTERS,
  type MethodFilterValue,
  type StatusFilterValue,
} from "@/features/invoices/constants/invoice.constants";
import { canTransitionTo } from "@/lib/invoice-status-mapper";
import { InvoiceStatus } from "@/lib/type";

function formatUsd(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTransitionOptions(current: InvoiceStatus): InvoiceStatus[] {
  const allStatuses = Object.values(InvoiceStatus);
  return allStatuses.filter((status) => canTransitionTo(current, status));
}

function getQuickActionLabel(status: InvoiceStatus): string {
  switch (status) {
    case InvoiceStatus.SENT:
      return "Mark Paid";
    case InvoiceStatus.OVERDUE:
      return "Resolve";
    case InvoiceStatus.LOCKED:
      return "Release/Refund";
    case InvoiceStatus.DRAFT:
      return "Send";
    default:
      return "Update";
  }
}

const INVOICES_TABLE_PREFERENCES_KEY = "invoices.list";

export default function InvoicesPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading invoices...</div>}>
      <InvoicesPageContent />
    </React.Suspense>
  );
}

function InvoicesPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQueryState = parseInvoicesQuery(searchParams, DEFAULT_INVOICE_VISIBLE_COLUMNS);
  const queryString = searchParams.toString();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilterValue>(initialQueryState.statusFilter);
  const [methodFilter, setMethodFilter] = React.useState<MethodFilterValue>(initialQueryState.methodFilter);
  const [keyword, setKeyword] = React.useState(initialQueryState.keyword);
  const [page, setPage] = React.useState(initialQueryState.page);
  const [openSections, setOpenSections] = React.useState({
    status: true,
    payment: true,
    search: true,
    scope: true,
  });
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(initialQueryState.visibleColumns);
  const { user } = useAuthStore();

  const projectId = searchParams.get("projectId") || undefined;
  const invoiceQueryParams = React.useMemo(
    () => ({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      projectId,
    }),
    [projectId, statusFilter],
  );

  const { data: invoices = [], isLoading, isError } = useInvoicesQuery(invoiceQueryParams);
  const updateStatusMutation = useUpdateInvoiceStatusMutation(invoiceQueryParams);

  const canUpdateStatus = user?.role === "CLIENT" || user?.role === "ADMIN";

  const filteredInvoices = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return invoices.filter((invoice) => {
      const matchesMethod = methodFilter === "ALL" || invoice.paymentMethod === methodFilter;
      if (!matchesMethod) return false;

      if (!normalizedKeyword) return true;

      const searchableFields = [
        invoice.id,
        invoice.title,
        invoice.projectId,
        invoice.txHash,
        invoice.walletAddress,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableFields.includes(normalizedKeyword);
    });
  }, [invoices, keyword, methodFilter]);

  const statusCounts = React.useMemo(() => {
    return invoices.reduce<Partial<Record<InvoiceStatus, number>>>((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [invoices]);

  const methodCounts = React.useMemo(() => {
    return invoices.reduce<Partial<Record<MethodFilterValue, number>>>((acc, invoice) => {
      const key = invoice.paymentMethod as MethodFilterValue;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [invoices]);

  const statusSectionOptions = React.useMemo(
    () =>
      INVOICE_STATUS_FILTERS.map((option) => {
        const count = option.value === "ALL" ? invoices.length : (statusCounts[option.value] ?? 0);
        return { ...option, count };
      }),
    [invoices.length, statusCounts],
  );

  const methodSectionOptions = React.useMemo(
    () =>
      INVOICE_METHOD_FILTERS.map((option) => {
        const count = option.value === "ALL" ? invoices.length : (methodCounts[option.value] ?? 0);
        return { ...option, count };
      }),
    [invoices.length, methodCounts],
  );

  const hasAppliedFilters =
    statusFilter !== "ALL" || methodFilter !== "ALL" || keyword.trim().length > 0 || !!projectId;

  const clearFilters = React.useCallback(() => {
    setStatusFilter("ALL");
    setMethodFilter("ALL");
    setKeyword("");
    setPage(0);
  }, []);

  const outstandingAmount = React.useMemo(
    () =>
      invoices
        .filter((invoice) => ![InvoiceStatus.PAID, InvoiceStatus.REFUNDED].includes(invoice.status))
        .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0),
    [invoices],
  );

  const collectedAmount = React.useMemo(
    () =>
      invoices
        .filter((invoice) => invoice.status === InvoiceStatus.PAID)
        .reduce((sum, invoice) => sum + (Number(invoice.amount) || 0), 0),
    [invoices],
  );

  const integrityScore = React.useMemo(() => {
    if (!invoices.length) return 100;
    const overdueCount = invoices.filter((invoice) => invoice.status === InvoiceStatus.OVERDUE).length;
    return Math.max(0, Math.round(((invoices.length - overdueCount) / invoices.length) * 1000) / 10);
  }, [invoices]);

  const totalPages = Math.ceil(filteredInvoices.length / INVOICE_PAGE_SIZE);
  const visibleInvoices = React.useMemo(
    () => filteredInvoices.slice(page * INVOICE_PAGE_SIZE, page * INVOICE_PAGE_SIZE + INVOICE_PAGE_SIZE),
    [filteredInvoices, page],
  );

  React.useEffect(() => {
    setPage(0);
  }, [projectId]);

  React.useEffect(() => {
    if (searchParams.get("cols")) return;

    const stored = readTableVisibleColumns(
      INVOICES_TABLE_PREFERENCES_KEY,
      DEFAULT_INVOICE_VISIBLE_COLUMNS,
    );

    setVisibleColumns(stored);
  }, [searchParams]);

  React.useEffect(() => {
    writeTableVisibleColumns(INVOICES_TABLE_PREFERENCES_KEY, visibleColumns);
  }, [visibleColumns]);

  React.useEffect(() => {
    if (page > 0 && page >= totalPages) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [page, totalPages]);

  React.useEffect(() => {
    const selectedCols = INVOICE_COLUMN_OPTIONS.filter((column) => visibleColumns[column.key])
      .map((column) => column.key)
      .join(",");

    const next = buildUpdatedQueryString(queryString, [
      { key: "status", value: statusFilter, defaultValue: "ALL" },
      { key: "method", value: methodFilter, defaultValue: "ALL" },
      { key: "q", value: keyword.trim() },
      { key: "cols", value: selectedCols, defaultValue: DEFAULT_INVOICE_VISIBLE_COLUMNS_QUERY },
      { key: "page", value: page + 1, defaultValue: 1 },
    ]);

    if (queryString !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [keyword, methodFilter, page, pathname, queryString, router, statusFilter, visibleColumns]);

  const handleStatusUpdate = React.useCallback(
    (invoiceId: string, nextStatus: InvoiceStatus) => {
      updateStatusMutation.mutate({ id: invoiceId, status: nextStatus });
    },
    [updateStatusMutation],
  );

  const toggleSection = React.useCallback(
    (key: keyof typeof openSections) => {
      setOpenSections((current) => ({ ...current, [key]: !current[key] }));
    },
    [],
  );

  const toggleColumn = React.useCallback((key: string) => {
    const targetColumn = INVOICE_COLUMN_OPTIONS.find((column) => column.key === key);
    if (targetColumn?.locked) return;

    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const resetColumns = React.useCallback(() => {
    setVisibleColumns(DEFAULT_INVOICE_VISIBLE_COLUMNS);
  }, []);

  const visibleColumnCount = React.useMemo(
    () => INVOICE_COLUMN_OPTIONS.filter((column) => visibleColumns[column.key]).length,
    [visibleColumns],
  );

  return (
    <div className="space-y-6 max-w-350">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white">Invoices</h1>
          <p className="text-slate-400 text-sm">
            Track billing, payment status, and escrow progress.
          </p>
        </div>
        {projectId ? (
          <p className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2">
            Filtered by project: {projectId}
          </p>
        ) : null}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-amber-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Outstanding</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300">
                <AlertTriangle className="h-3 w-3" />
                Awaiting Payment
              </span>
            </div>
            <span className="text-4xl font-bold text-white font-mono">{formatUsd(String(outstandingAmount))}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Total Collected</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                30-Day Velocity
              </span>
            </div>
            <span className="text-4xl font-bold text-white font-mono">{formatUsd(String(collectedAmount))}</span>
          </div>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl transition-all duration-300 group hover:scale-[1.02] hover:bg-slate-800/80 hover:ring-white/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">System Integrity</p>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300">
                <ShieldCheck className="h-3 w-3" />
                Verified
              </span>
            </div>
            <span className="text-4xl font-bold text-white">{integrityScore}%</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
                <p className="text-xs text-slate-500">Section-based invoice controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection
              title="Search"
              isOpen={openSections.search}
              onToggle={() => toggleSection("search")}
            >
              <label className="relative block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Find invoice, tx hash, project..."
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setPage(0);
                  }}
                  className="h-9 w-full rounded-md border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </label>
            </FilterSection>

            <FilterSection
              title="Status"
              isOpen={openSections.status}
              onToggle={() => toggleSection("status")}
            >
              <div className="space-y-1">
                {statusSectionOptions.map((option) => {
                  const isActive = statusFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setStatusFilter(option.value);
                        setPage(0);
                      }}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-emerald-300" : "text-slate-600"}`} />
                        {option.label}
                      </span>
                      <span className="text-[11px] text-slate-500">{option.count}</span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection
              title="Payment"
              isOpen={openSections.payment}
              onToggle={() => toggleSection("payment")}
            >
              <div className="space-y-1">
                {methodSectionOptions.map((option) => {
                  const isActive = methodFilter === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setMethodFilter(option.value);
                        setPage(0);
                      }}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-cyan-300" : "text-slate-600"}`} />
                        {option.label}
                      </span>
                      <span className="text-[11px] text-slate-500">{option.count}</span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection
              title="Scope"
              isOpen={openSections.scope}
              onToggle={() => toggleSection("scope")}
            >
              {projectId ? (
                <p className="rounded-md border border-violet-500/30 bg-violet-500/10 px-3 py-2 text-xs text-violet-200">
                  Scoped by project: <span className="font-mono">{projectId}</span>
                </p>
              ) : (
                <p className="rounded-md border border-slate-800 bg-slate-900/60 px-3 py-2 text-xs text-slate-400">
                  No project scope from query params.
                </p>
              )}
            </FilterSection>
          </div>
        </aside>

        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
          <DataTableToolbar
            title="All Invoices"
            resultCount={filteredInvoices.length}
            totalCount={invoices.length}
            resultLabel="invoices"
            columns={INVOICE_COLUMN_OPTIONS}
            visibleColumns={visibleColumns}
            onToggleColumn={toggleColumn}
            onResetColumns={resetColumns}
          />

        {hasAppliedFilters && (
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applied</span>
              {statusFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  Status: {statusFilter}
                </span>
              )}
              {methodFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  Payment: {methodFilter}
                </span>
              )}
              {keyword.trim().length > 0 && (
                <span className="px-2 py-1 rounded-md border border-slate-500/30 bg-slate-500/10 text-slate-300">
                  Search: {keyword}
                </span>
              )}
              {projectId && (
                <span className="px-2 py-1 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-300">
                  Project scoped
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          {isError ? (
            <div className="p-6 text-sm text-rose-300 bg-rose-500/10 border-b border-rose-500/20">
              Failed to load invoices. Please refresh and try again.
            </div>
          ) : null}

          <table className="w-full min-w-270 text-left">
            <thead className="border-b border-white/5 bg-slate-900/80">
              <tr>
                {visibleColumns.invoice && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Invoice</th>}
                {visibleColumns.title && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Title</th>}
                {visibleColumns.amount && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>}
                {visibleColumns.dueDate && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Due Date</th>}
                {visibleColumns.status && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>}
                {visibleColumns.payment && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Payment</th>}
                {visibleColumns.reference && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Reference</th>}
                {visibleColumns.action && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-right">Action</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4" colSpan={visibleColumnCount}>
                      <div className="h-6 w-full rounded bg-slate-800/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="px-4 py-8 text-center text-sm text-slate-400">
                    No invoices found for current filters.
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((invoice) => {
                  const transitions = getTransitionOptions(invoice.status);
                  return (
                    <tr key={invoice.id} className="group bg-slate-800/20 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative">
                      {visibleColumns.invoice && (
                        <td className="px-6 py-5 text-xs font-mono text-slate-200">
                          <Link href={`/invoices/${invoice.id}`} className="hover:text-emerald-300 transition-colors">
                            #{invoice.id}
                          </Link>
                        </td>
                      )}
                      {visibleColumns.title && (
                        <td className="px-6 py-5 text-sm font-medium text-white">
                          <Link href={`/invoices/${invoice.id}`} className="hover:text-emerald-300 transition-colors">
                            {invoice.title}
                          </Link>
                        </td>
                      )}
                      {visibleColumns.amount && <td className="px-6 py-5 text-sm font-semibold text-white">{formatUsd(invoice.amount)}</td>}
                      {visibleColumns.dueDate && <td className="px-6 py-5 text-xs text-slate-300">{formatDate(invoice.dueDate)}</td>}
                      {visibleColumns.status && (
                        <td className="px-6 py-5">
                          <InvoiceStatusPill status={invoice.status} />
                        </td>
                      )}
                      {visibleColumns.payment && <td className="px-6 py-5 text-xs text-slate-300">{invoice.paymentMethod}</td>}
                      {visibleColumns.reference && (
                        <td className="px-6 py-5 text-xs font-mono text-slate-400">
                          {invoice.txHash || invoice.smartContractId || "-"}
                        </td>
                      )}
                      {visibleColumns.action && <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <RowActionMenu
                            items={[
                              {
                                key: "view-invoice-details",
                                label: "View Details",
                                href: `/invoices/${invoice.id}`,
                              },
                              {
                                key: "view-project",
                                label: "View Project",
                                href: `/projects/${invoice.projectId}`,
                              },
                              {
                                key: "open-project-invoices",
                                label: "Open Project Invoices",
                                href: `/invoices?projectId=${invoice.projectId}`,
                              },
                            ]}
                          />
                          {canUpdateStatus && transitions.length > 0 ? (
                            <select
                              className="h-8 rounded-md border border-slate-700 bg-slate-950 px-2 text-xs text-slate-200 focus:border-emerald-500/50 focus:outline-none"
                              defaultValue=""
                              onChange={(event) => {
                                const nextStatus = event.target.value as InvoiceStatus;
                                if (!nextStatus) return;
                                handleStatusUpdate(invoice.id, nextStatus);
                                event.target.value = "";
                              }}
                              disabled={updateStatusMutation.isPending}
                            >
                              <option value="">{getQuickActionLabel(invoice.status)}...</option>
                              {transitions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="text-xs text-slate-500">-</span>
                          )}
                        </div>
                      </td>}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={filteredInvoices.length}
          onPageChange={setPage}
          label="invoices"
        />
        </div>
      </section>
    </div>
  );
}
