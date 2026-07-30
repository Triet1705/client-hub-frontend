"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { AlertTriangle, CheckCircle2, CircleDot, ShieldCheck } from "lucide-react";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { Pagination } from "@/components/ui/pagination";
import { FilterSection } from "@/components/ui/filter-section";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { readTableVisibleColumns, writeTableVisibleColumns } from "@/lib/table-preferences";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { InvoiceStatusDropdown } from "@/features/invoices/components/invoice-status-dropdown";
import { CreateInvoiceModal } from "@/features/invoices/components/create-invoice-modal";
import { useInvoicesQuery, useUpdateInvoiceStatusMutation } from "@/features/invoices/hooks/use-invoices";
import { parseInvoicesQuery } from "@/features/invoices/query/invoices-query.schema";
import { SearchInput } from "@/components/ui/search-input";
import { SummaryCard } from "@/components/ui/summary-card";
import { formatFiat as formatUsd, formatInvoiceId } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/type";
import { InvoicesSkeleton } from "@/components/skeletons/page-skeletons";

import {
  DEFAULT_INVOICE_VISIBLE_COLUMNS,
  DEFAULT_INVOICE_VISIBLE_COLUMNS_QUERY,
  INVOICE_COLUMN_OPTIONS,
  INVOICE_METHOD_FILTERS,
  INVOICE_PAGE_SIZE,
  INVOICE_STATUS_FILTERS,
  PAYMENT_METHOD_LABELS,
  type MethodFilterValue,
  type StatusFilterValue,
} from "@/features/invoices/constants/invoice.constants";
const INVOICES_TABLE_PREFERENCES_KEY = "invoices.list";

export default function InvoicesPage() {
  return (
    <React.Suspense fallback={<InvoicesSkeleton />}>
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
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [openSections, setOpenSections] = React.useState({
    status: true,
    payment: true,
    search: true,
    scope: true,
  });
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(initialQueryState.visibleColumns);
  const { user } = useAuthStore();
  const canCreateInvoice = user?.role === "CLIENT" || user?.role === "ADMIN";

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
    if (projectId) {
      router.push("/invoices");
    }
  }, [projectId, router]);

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

  if (isLoading && invoices.length === 0) {
    return <InvoicesSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-350">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-content-primary">Invoices</h1>
          <p className="text-content-secondary text-sm">
            Track billing, payment status, and escrow progress.
          </p>
        </div>
        {projectId ? (
          <p className="text-xs font-mono text-theme-accent bg-action-subtle border border-theme-accent rounded-lg px-3 py-2">
            Filtered by project: {projectId}
          </p>
        ) : null}
        {canCreateInvoice ? (
          <button
            onClick={() => {
              setIsCreateModalOpen(true);
            }}
            className="ml-auto flex items-center gap-2 rounded-xl bg-action-primary px-5 py-2.5 text-sm font-bold text-action-primary-foreground shadow-[0_8px_20px_var(--shadow-color)] transition-all hover:-translate-y-0.5 hover:bg-action-primary-hover hover:shadow-[0_10px_24px_var(--shadow-color)] active:translate-y-0"
          >
            Create Invoice
          </button>
        ) : null}
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard
          label="Total Outstanding"
          value={formatUsd(String(outstandingAmount))}
          icon={AlertTriangle}
          badge={{ label: "Awaiting Payment", variant: "amber" }}
        />
        <SummaryCard
          label="Total Collected"
          value={formatUsd(String(collectedAmount))}
          icon={CheckCircle2}
          badge={{ label: "30-Day Velocity", variant: "emerald" }}
        />
        <SummaryCard
          label="System Integrity"
          value={`${integrityScore}%`}
          icon={ShieldCheck}
          badge={{ label: "Verified", variant: "cyan" }}
        />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-content-secondary">Filters</h2>
                <p className="text-xs text-content-muted">Section-based invoice controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-content-secondary hover:text-content-primary transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection
              title="Search"
              isOpen={openSections.search}
              onToggle={() => toggleSection("search")}
            >
              <SearchInput
                placeholder="Find invoice, tx hash, project..."
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setPage(0);
                }}
                className="h-9 rounded-md border-theme-border bg-surface-base/70 focus:border-theme-accent focus:ring-theme-accent"
              />
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
                          ? "border-theme-accent bg-action-subtle text-theme-accent"
                          : "border-theme-border bg-surface/60 text-content-secondary hover:border-theme-border"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-theme-accent" : "text-content-muted"}`} />
                        {option.label}
                      </span>
                      <span className="text-[11px] text-content-muted">{option.count}</span>
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
                          ? "border-status-info-border bg-status-info-surface text-status-info-text"
                          : "border-theme-border bg-surface/60 text-content-secondary hover:border-theme-border"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-status-info-text" : "text-content-muted"}`} />
                        {option.label}
                      </span>
                      <span className="text-[11px] text-content-muted">{option.count}</span>
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
                <div className="space-y-2">
                  <p className="rounded-md border border-status-web3-border bg-status-web3-surface px-3 py-2 text-xs text-status-web3-text">
                    Scoped by project: <span className="font-mono">{projectId}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/invoices")}
                    className="text-[11px] font-bold text-status-web3-text hover:text-content-primary transition-colors"
                  >
                    × Clear project scope
                  </button>
                </div>
              ) : (
                <p className="rounded-md border border-theme-border bg-surface/60 px-3 py-2 text-xs text-content-secondary">
                  No project scope from query params.
                </p>
              )}
            </FilterSection>
          </div>
        </aside>

        <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
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
          <div className="px-6 py-3 border-b border-theme-border bg-surface-base/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs text-content-secondary">
              <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Applied</span>
              {statusFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-theme-accent bg-action-subtle text-theme-accent">
                  Status: {statusFilter}
                </span>
              )}
              {methodFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-status-info-border bg-status-info-surface text-status-info-text">
                  Payment: {methodFilter}
                </span>
              )}
              {keyword.trim().length > 0 && (
                <span className="px-2 py-1 rounded-md border border-content-muted/30 bg-status-neutral-surface text-content-secondary">
                  Search: {keyword}
                </span>
              )}
              {projectId && (
                <span className="px-2 py-1 rounded-md border border-status-web3-border bg-status-web3-surface text-status-web3-text">
                  Project scoped
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearFilters}
              className="text-[11px] font-bold text-content-secondary hover:text-content-primary transition-colors"
            >
              Clear all
            </button>
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          {isError ? (
            <div className="p-6 text-sm text-status-danger-text bg-status-danger-surface border-b border-status-danger-border">
              Failed to load invoices. Please refresh and try again.
            </div>
          ) : null}

          <table className="w-full min-w-270 text-left">
            <thead className="border-b border-theme-border bg-surface/80">
              <tr>
                {visibleColumns.invoice && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Invoice</th>}
                {visibleColumns.title && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Title</th>}
                {visibleColumns.amount && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Amount</th>}
                {visibleColumns.dueDate && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Due Date</th>}
                {visibleColumns.status && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Status</th>}
                {visibleColumns.payment && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Payment</th>}
                {visibleColumns.reference && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted">Reference</th>}
                {visibleColumns.action && <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-content-muted text-right">Action</th>}
              </tr>
            </thead>

            <tbody className="divide-y divide-theme-border">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4" colSpan={visibleColumnCount}>
                      <div className="h-6 w-full rounded bg-surface-elevated/50 animate-pulse" />
                    </td>
                  </tr>
                ))
              ) : visibleInvoices.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumnCount} className="px-4 py-8 text-center text-sm text-content-secondary">
                    No invoices found for current filters.
                  </td>
                </tr>
              ) : (
                visibleInvoices.map((invoice) => {
                  return (
                    <tr key={invoice.id} className="group bg-surface-elevated/20 hover:bg-surface-elevated/60 ring-1 ring-transparent hover:ring-theme-border hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative">
                      {visibleColumns.invoice && (
                        <td className="px-6 py-5 text-xs font-mono text-content-secondary">
                          <Link href={`/invoices/${invoice.id}`} className="hover:text-theme-accent transition-colors">
                            {formatInvoiceId(invoice.id)}
                          </Link>
                        </td>
                      )}
                      {visibleColumns.title && (
                        <td className="px-6 py-5 text-sm font-medium text-content-primary">
                          <Link href={`/invoices/${invoice.id}`} className="hover:text-theme-accent transition-colors">
                            {invoice.title}
                          </Link>
                        </td>
                      )}
                      {visibleColumns.amount && <td className="px-6 py-5 text-sm font-semibold text-content-primary">{formatUsd(invoice.amount)}</td>}
                      {visibleColumns.dueDate && (
                        <td className="px-6 py-5 text-xs text-content-secondary">
                          {invoice.dueDate ? format(new Date(invoice.dueDate), "dd/MM/yy") : "-"}
                        </td>
                      )}
                      {visibleColumns.status && (
                        <td className="px-6 py-5">
                          <InvoiceStatusDropdown
                            invoiceId={invoice.id}
                            status={invoice.status}
                            canEdit={canUpdateStatus}
                            paymentMethod={invoice.paymentMethod}
                            onUpdate={(nextStatus) => handleStatusUpdate(invoice.id, nextStatus)}
                            isPending={updateStatusMutation.isPending}
                          />
                        </td>
                      )}
                      {visibleColumns.payment && <td className="px-6 py-5 text-xs text-content-secondary">{PAYMENT_METHOD_LABELS[invoice.paymentMethod] ?? invoice.paymentMethod}</td>}
                      {visibleColumns.reference && (
                        <td className="px-6 py-5 text-xs font-mono text-content-secondary">
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
      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultProjectId={projectId || undefined}
      />
    </div>
  );
}
