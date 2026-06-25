"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { CircleDot } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";
import { Pagination } from "@/components/ui/pagination";
import { FilterSection } from "@/components/ui/filter-section";
import { SearchInput } from "@/components/ui/search-input";
import { useAdminEventsQuery } from "@/features/admin/hooks/use-admin";
import type { AdminEventCategory, AdminEventSeverity } from "@/features/admin/types/admin.types";
import { cn } from "@/lib/utils";

const categories: Array<AdminEventCategory | "ALL"> = ["ALL", "AUTH", "USER", "PROJECT", "TASK", "INVOICE", "AUDIT", "SYSTEM", "WEB3"];
const severities: Array<AdminEventSeverity | "ALL"> = ["ALL", "INFO", "SUCCESS", "WARNING", "CRITICAL"];

const severityTone = {
  INFO: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  SUCCESS: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  WARNING: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  CRITICAL: "border-rose-500/25 bg-rose-500/10 text-rose-300",
};

export default function AdminEventsPage() {
  const [page, setPage] = React.useState(0);
  const [category, setCategory] = React.useState<AdminEventCategory | "ALL">("ALL");
  const [severity, setSeverity] = React.useState<AdminEventSeverity | "ALL">("ALL");
  const [entityType, setEntityType] = React.useState("");
  const [tenantId, setTenantId] = React.useState("");

  const [openSections, setOpenSections] = React.useState({
    category: true,
    severity: true,
    entityType: true,
    tenantId: true,
  });

  const toggleSection = React.useCallback((key: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setCategory("ALL");
    setSeverity("ALL");
    setEntityType("");
    setTenantId("");
    setPage(0);
  }, []);

  React.useEffect(() => {
    setPage(0);
  }, [category, severity, entityType, tenantId]);

  const params = React.useMemo(() => ({
    page,
    size: 20,
    category,
    severity,
    entityType: entityType.trim() || undefined,
    tenantId: tenantId.trim() || undefined,
  }), [category, entityType, page, severity, tenantId]);

  const { data, isLoading, isError } = useAdminEventsQuery(params);

  const hasAppliedFilters = category !== "ALL" || severity !== "ALL" || !!entityType || !!tenantId;

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
        Events are unavailable.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-white">Domain Events</h2>
        <p className="text-slate-400">
          Normalized product and system activity derived from audit records.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
                <p className="text-xs text-slate-500">Event criteria</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection title="Category" isOpen={openSections.category} onToggle={() => toggleSection("category")}>
              <div className="space-y-1">
                {categories.map((option) => {
                  const isActive = category === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setCategory(option)}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-emerald-300" : "text-slate-600"}`} />
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Severity" isOpen={openSections.severity} onToggle={() => toggleSection("severity")}>
              <div className="space-y-1">
                {severities.map((option) => {
                  const isActive = severity === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSeverity(option)}
                      className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-blue-300" : "text-slate-600"}`} />
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FilterSection>

            <FilterSection title="Entity Type" isOpen={openSections.entityType} onToggle={() => toggleSection("entityType")}>
              <SearchInput
                placeholder="E.g. PROJECT..."
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
          </div>
        </aside>

        <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
          {hasAppliedFilters && (
            <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applied</span>
                {category !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    Category: {category}
                  </span>
                )}
                {severity !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-300">
                    Severity: {severity}
                  </span>
                )}
                {entityType && (
                  <span className="px-2 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
                    Entity: {entityType}
                  </span>
                )}
                {tenantId && (
                  <span className="px-2 py-1 rounded-md border border-slate-500/30 bg-slate-500/10 text-slate-300">
                    Tenant: {tenantId}
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

          <div className="divide-y divide-slate-800/50">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="px-5 py-4">
                  <div className="h-16 animate-pulse rounded-lg bg-surface-base/70" />
                </div>
              ))
            ) : data?.content.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-content-muted">No events match the selected filters.</p>
            ) : (
              data?.content.map((event) => (
                <article key={`${event.id}-${event.occurredAt}`} className="group grid gap-3 px-5 py-4 md:grid-cols-[auto_1fr_auto] hover:bg-slate-800/20 transition-colors">
                  <span className="mt-2 h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-200">{event.title}</h3>
                      <span className={cn("rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest", severityTone[event.severity])}>
                        {event.severity}
                      </span>
                      <span className="rounded-md border border-slate-700 bg-slate-800/50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {event.category}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-400">{event.description}</p>
                    <p className="mt-2 truncate text-xs text-slate-500">
                      Tenant {event.tenantId} - {event.entityType}{event.entityId ? ` #${event.entityId}` : ""}
                    </p>
                  </div>
                  <p className="text-xs text-slate-500 md:text-right">
                    {formatDistanceToNow(new Date(event.occurredAt), { addSuffix: true })}
                  </p>
                </article>
              ))
            )}
          </div>
          
          {data && data.totalPages > 1 && (
            <div className="p-4 border-t border-slate-800/50">
              <Pagination
                page={page}
                totalPages={data.totalPages}
                totalElements={data.totalElements}
                onPageChange={setPage}
                label="events"
              />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
