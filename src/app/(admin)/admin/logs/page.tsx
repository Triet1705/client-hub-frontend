"use client";

import * as React from "react";
import { AuditLogTable } from "@/features/admin/components/audit-log-table";
import { FilterSection } from "@/components/ui/filter-section";
import { SearchInput } from "@/components/ui/search-input";
import { CircleDot } from "lucide-react";

export default function AdminAuditLogsPage() {
  const [action, setAction] = React.useState<string>("");
  const [entityType, setEntityType] = React.useState<string>("");
  const [tenantId, setTenantId] = React.useState<string>("");
  const [anchored, setAnchored] = React.useState<boolean | undefined>(undefined);

  const [openSections, setOpenSections] = React.useState({
    action: true,
    entityType: true,
    tenantId: true,
    anchored: true,
  });

  const toggleSection = React.useCallback((key: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setAction("");
    setEntityType("");
    setTenantId("");
    setAnchored(undefined);
  }, []);

  const hasAppliedFilters = !!action || !!entityType || !!tenantId || anchored !== undefined;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Audit Records</h2>
        <p className="text-slate-400">
          Security and compliance records across tenants. Domain activity is available in Events.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
                <p className="text-xs text-slate-500">Audit constraints</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection title="Action" isOpen={openSections.action} onToggle={() => toggleSection("action")}>
              <SearchInput
                placeholder="E.g. USER_LOGIN..."
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="h-9 rounded-md border-slate-700 bg-slate-950/70 focus:border-emerald-500/50 focus:ring-emerald-500/50"
              />
            </FilterSection>

            <FilterSection title="Entity Type" isOpen={openSections.entityType} onToggle={() => toggleSection("entityType")}>
              <SearchInput
                placeholder="E.g. USER..."
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="h-9 rounded-md border-slate-700 bg-slate-950/70 focus:border-emerald-500/50 focus:ring-emerald-500/50"
              />
            </FilterSection>

            <FilterSection title="Tenant ID" isOpen={openSections.tenantId} onToggle={() => toggleSection("tenantId")}>
              <SearchInput
                placeholder="E.g. tnt_123..."
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="h-9 rounded-md border-slate-700 bg-slate-950/70 focus:border-emerald-500/50 focus:ring-emerald-500/50"
              />
            </FilterSection>

            <FilterSection title="Anchored Status" isOpen={openSections.anchored} onToggle={() => toggleSection("anchored")}>
              <div className="space-y-1">
                {[
                  { label: "All", value: undefined },
                  { label: "Anchored", value: true },
                  { label: "Pending", value: false },
                ].map((option, idx) => {
                  const isActive = anchored === option.value;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAnchored(option.value)}
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
                {action && (
                  <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    Action: {action}
                  </span>
                )}
                {entityType && (
                  <span className="px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-300">
                    Entity: {entityType}
                  </span>
                )}
                {tenantId && (
                  <span className="px-2 py-1 rounded-md border border-slate-500/30 bg-slate-500/10 text-slate-300">
                    Tenant: {tenantId}
                  </span>
                )}
                {anchored !== undefined && (
                  <span className="px-2 py-1 rounded-md border border-rose-500/30 bg-rose-500/10 text-rose-300">
                    Status: {anchored ? "Anchored" : "Pending"}
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

          <div className="p-1">
            <AuditLogTable 
              action={action}
              entityType={entityType}
              tenantId={tenantId}
              anchored={anchored}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
