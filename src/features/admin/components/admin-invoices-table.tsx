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
            <thead className="bg-slate-950/40 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5">
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
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={7} className="px-6 py-4">
                      <div className="h-6 w-full animate-pulse rounded bg-slate-800/50" />
                    </td>
                  </tr>
                ))
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <p className="text-sm font-medium text-slate-400">
                        Failed to load data
                      </p>
                      <button
                        onClick={() => window.location.reload()}
                        className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        Try again
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-slate-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr 
                    key={inv.id} 
                    onClick={() => setSelectedInvoice(inv)}
                    className="group bg-slate-800/20 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative cursor-pointer"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">INV-{inv.id}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{format(new Date(inv.createdAt), "MMM d, yyyy")}</p>
                    </td>
                    <td className="px-6 py-5 font-mono text-sm font-bold text-white">
                      ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ring-1 ${
                        inv.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" :
                        inv.status === "DRAFT" ? "bg-slate-500/10 text-slate-400 ring-slate-500/30" :
                        inv.status === "DISPUTED" ? "bg-red-500/10 text-red-400 ring-red-500/30" :
                        "bg-amber-500/10 text-amber-400 ring-amber-500/30"
                      }`}>
                        {inv.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-slate-300 max-w-[200px] truncate">{inv.projectTitle}</p>
                    </td>
                    <td className="px-6 py-5 text-slate-500 font-mono text-xs">{inv.tenantId}</td>
                    <td className="px-6 py-5 text-slate-500 text-xs">{inv.createdByEmail || "—"}</td>
                    <td className="px-6 py-5 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setInvoiceForForceStatus(inv); }}
                        className="text-red-500 hover:text-red-400 font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20 text-[10px] uppercase"
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
