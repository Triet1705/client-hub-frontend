"use client";

import * as React from "react";
import { AdminInvoicesTable } from "@/features/admin/components/admin-invoices-table";
import { FilterSection } from "@/components/ui/filter-section";
import { CircleDot } from "lucide-react";
import {
  ADMIN_INVOICE_STATUS_OPTIONS,
  type AdminInvoiceStatusFilterValue,
} from "@/features/admin/constants/admin-table.constants";

export default function AdminInvoicesPage() {
  const [status, setStatus] = React.useState<AdminInvoiceStatusFilterValue>("ALL");
  const [openSections, setOpenSections] = React.useState({
    status: true,
  });

  const toggleSection = React.useCallback((key: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setStatus("ALL");
  }, []);

  const hasAppliedFilters = (status as string) !== "ALL";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Invoice & Billing</h2>
        <p className="text-slate-400">
          View all invoices across tenants and perform emergency state-machine overrides.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
                <p className="text-xs text-slate-500">Invoice controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection title="Status" isOpen={openSections.status} onToggle={() => toggleSection("status")}>
              <div className="space-y-1">
                {ADMIN_INVOICE_STATUS_OPTIONS.map((option) => {
                  const isActive = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
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
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          </div>
        </aside>

        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
          {hasAppliedFilters && (
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applied</span>
                {(status as string) !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    Status: {status}
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

          <AdminInvoicesTable status={status} />
        </div>
      </section>
    </div>
  );
}
