"use client";

import * as React from "react";
import { useAdminInvoicesQuery } from "@/features/admin/hooks/use-admin";
import { format } from "date-fns";
import { Pagination } from "@/components/ui/pagination";
import { ForceStatusModal } from "./force-status-modal";
import { AdminInvoiceDetailSlideover } from "./admin-invoice-detail-slideover";
import type { AdminInvoice } from "../types/admin.types";
import type { AdminInvoiceStatusFilterValue } from "@/features/admin/constants/admin-table.constants";

interface AdminInvoicesTableProps {
  status: AdminInvoiceStatusFilterValue;
}

export function AdminInvoicesTable({ status }: AdminInvoicesTableProps) {
  const [page, setPage] = React.useState(0);
  const [selectedInvoice, setSelectedInvoice] = React.useState<AdminInvoice | null>(null);
  const [invoiceForForceStatus, setInvoiceForForceStatus] = React.useState<AdminInvoice | null>(null);

  const { data, isLoading, isError } = useAdminInvoicesQuery({
    page,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const filteredInvoices = React.useMemo(() => {
    if (!data?.content) return [];
    if (status === "ALL") return data.content;
    return data.content.filter((inv) => inv.status === status);
  }, [data, status]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-base/40 text-[10px] font-bold uppercase tracking-widest text-content-muted border-b border-theme-border">
              <tr>
                <th className="px-6 py-4 font-medium">Invoice</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Project</th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Created By</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 w-full animate-pulse rounded bg-surface-elevated/50" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm font-medium text-content-secondary">
                        Failed to load data
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs font-bold text-theme-accent hover:text-theme-accent transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-content-muted">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => setSelectedInvoice(inv)}
                    className="group bg-surface-elevated/20 hover:bg-surface-elevated/60 ring-1 ring-transparent hover:ring-theme-border hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-content-primary group-hover:text-theme-accent transition-colors">INV-{inv.id}</p>
                      <p className="text-xs text-content-muted mt-0.5">{format(new Date(inv.createdAt), "MMM d, yyyy")}</p>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm font-bold text-content-primary">
                      ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ring-1 ${
                        inv.status === "PAID" ? "bg-action-subtle text-theme-accent ring-theme-accent" :
                        inv.status === "DRAFT" ? "bg-status-neutral-surface text-content-secondary ring-status-neutral-border" :
                        inv.status === "DISPUTED" ? "bg-status-danger-surface text-status-danger-text ring-status-danger-border" :
                        "bg-status-warning-surface text-status-warning-text ring-status-warning-border"
                      }`}>
                        {inv.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-content-secondary max-w-[200px] truncate">{inv.projectTitle}</p>
                    </td>
                    <td className="px-6 py-5 text-content-muted font-mono text-xs">{inv.tenantId}</td>
                    <td className="px-6 py-5 text-content-muted text-xs">{inv.createdByEmail || "—"}</td>
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setInvoiceForForceStatus(inv); }}
                        className="text-status-danger-text hover:text-status-danger-text font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-status-danger-surface px-3 py-1.5 rounded-lg border border-status-danger-border text-[10px] uppercase"
                      >
                        Force Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={setPage}
            label="invoices"
          />
        )}
      {invoiceForForceStatus && (
        <ForceStatusModal
          invoiceId={invoiceForForceStatus.id}
          currentStatus={invoiceForForceStatus.status}
          isOpen={!!invoiceForForceStatus}
          onClose={() => setInvoiceForForceStatus(null)}
        />
      )}

      {selectedInvoice && (
        <AdminInvoiceDetailSlideover
          invoice={selectedInvoice}
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onForceStatus={() => {
            setInvoiceForForceStatus(selectedInvoice);
            setSelectedInvoice(null);
          }}
        />
      )}
    </>
  );
}
