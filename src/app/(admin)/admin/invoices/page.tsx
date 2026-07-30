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
        <h2 className="text-3xl font-bold tracking-tight text-content-primary">Invoice & Billing</h2>
        <p className="text-content-secondary">
          View all invoices across tenants and perform emergency state-machine overrides.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-content-secondary">Filters</h2>
                <p className="text-xs text-content-muted">Invoice controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-content-secondary hover:text-content-primary transition-colors"
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
                          ? "border-theme-accent bg-action-subtle text-theme-accent"
                          : "border-theme-border bg-surface/60 text-content-secondary hover:border-theme-border"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-theme-accent" : "text-content-muted"}`} />
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>
          </div>
        </aside>

        <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
          {hasAppliedFilters && (
            <div className="px-6 py-3 border-b border-theme-border bg-surface-base/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs text-content-secondary">
                <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Applied</span>
                {(status as string) !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-theme-accent bg-action-subtle text-theme-accent">
                    Status: {status}
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

          <AdminInvoicesTable status={status} />
        </div>
      </section>
    </div>
  );
}
