"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CircleDot, Database, ListChecks } from "lucide-react";
import { AuditLogTable } from "@/features/admin/components/audit-log-table";
import { AuditAnchorBatches } from "@/features/admin/components/audit-anchor-batches";
import { AuditAnchorSummary } from "@/features/admin/components/audit-anchor-summary";
import { FilterSection } from "@/components/ui/filter-section";
import { SearchInput } from "@/components/ui/search-input";
import { cn } from "@/lib/utils";

type AuditTab = "records" | "batches";
type AnchorStatus = "WAITING" | "PENDING" | "VERIFIED" | "FAILED";

export default function AdminAuditLogsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab: AuditTab = searchParams.get("tab") === "batches" ? "batches" : "records";
  const [action, setAction] = React.useState("");
  const [entityType, setEntityType] = React.useState("");
  const [tenantId, setTenantId] = React.useState("");
  const [anchorStatus, setAnchorStatus] = React.useState<AnchorStatus | undefined>();
  const [openSections, setOpenSections] = React.useState({ action: true, entityType: true, tenantId: true, anchorStatus: true });

  const selectTab = (tab: AuditTab) => {
    const next = new URLSearchParams(searchParams.toString());
    next.set("tab", tab);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setAction("");
    setEntityType("");
    setTenantId("");
    setAnchorStatus(undefined);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-content-primary">Audit Console</h1>
        <p className="text-sm text-content-secondary">Inspect compliance records and the blockchain batches that protect their integrity.</p>
      </header>

      <AuditAnchorSummary />

      <div className="flex w-fit gap-1 rounded-lg border border-theme-border bg-surface/60 p-1" role="tablist" aria-label="Audit console views">
        <button type="button" role="tab" aria-selected={activeTab === "records"} onClick={() => selectTab("records")} className={cn("inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold", activeTab === "records" ? "bg-surface-sunken text-content-primary" : "text-content-secondary hover:text-content-primary")}>
          <ListChecks className="h-4 w-4" /> Audit Records
        </button>
        <button type="button" role="tab" aria-selected={activeTab === "batches"} onClick={() => selectTab("batches")} className={cn("inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-semibold", activeTab === "batches" ? "bg-surface-sunken text-content-primary" : "text-content-secondary hover:text-content-primary")}>
          <Database className="h-4 w-4" /> Anchor Batches
        </button>
      </div>

      {activeTab === "batches" ? (
        <AuditAnchorBatches />
      ) : (
        <section className="grid grid-cols-1 gap-5 xl:grid-cols-[17rem_minmax(0,1fr)] xl:items-start">
          <aside className="space-y-3 rounded-lg border border-theme-border bg-surface/60 p-4 xl:sticky xl:top-24">
            <div className="flex items-center justify-between">
              <div><h2 className="text-sm font-semibold text-content-primary">Filters</h2><p className="text-xs text-content-muted">Narrow audit evidence</p></div>
              <button type="button" onClick={clearFilters} className="text-xs font-semibold text-content-secondary hover:text-content-primary">Reset</button>
            </div>

            <FilterSection title="Action" isOpen={openSections.action} onToggle={() => setOpenSections((state) => ({ ...state, action: !state.action }))}>
              <SearchInput placeholder="E.g. INVOICE_PAID" value={action} onChange={(event) => setAction(event.target.value)} className="h-9 rounded-md border-theme-border bg-surface-base/70" />
            </FilterSection>
            <FilterSection title="Entity Type" isOpen={openSections.entityType} onToggle={() => setOpenSections((state) => ({ ...state, entityType: !state.entityType }))}>
              <SearchInput placeholder="E.g. INVOICE" value={entityType} onChange={(event) => setEntityType(event.target.value)} className="h-9 rounded-md border-theme-border bg-surface-base/70" />
            </FilterSection>
            <FilterSection title="Tenant ID" isOpen={openSections.tenantId} onToggle={() => setOpenSections((state) => ({ ...state, tenantId: !state.tenantId }))}>
              <SearchInput placeholder="E.g. default" value={tenantId} onChange={(event) => setTenantId(event.target.value)} className="h-9 rounded-md border-theme-border bg-surface-base/70" />
            </FilterSection>
            <FilterSection title="Anchor Status" isOpen={openSections.anchorStatus} onToggle={() => setOpenSections((state) => ({ ...state, anchorStatus: !state.anchorStatus }))}>
              <div className="space-y-1">
                {([undefined, "WAITING", "PENDING", "VERIFIED", "FAILED"] as const).map((value) => (
                  <button key={value ?? "ALL"} type="button" onClick={() => setAnchorStatus(value)} className={cn("flex w-full items-center gap-2 rounded-md border px-3 py-2 text-left text-xs", anchorStatus === value ? "border-theme-accent bg-action-subtle text-theme-accent" : "border-theme-border text-content-secondary hover:border-theme-border")}>
                    <CircleDot className="h-3.5 w-3.5" /> {value ?? "ALL"}
                  </button>
                ))}
              </div>
            </FilterSection>
          </aside>

          <AuditLogTable action={action} entityType={entityType} tenantId={tenantId} anchorStatus={anchorStatus} />
        </section>
      )}
    </div>
  );
}
