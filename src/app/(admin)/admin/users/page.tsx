"use client";

import * as React from "react";
import { UserTable } from "@/features/admin/components/user-table";
import { FilterSection } from "@/components/ui/filter-section";
import { SearchInput } from "@/components/ui/search-input";
import { CircleDot } from "lucide-react";
import {
  ADMIN_USER_ROLE_OPTIONS,
  ADMIN_USER_STATUS_OPTIONS,
  type AdminUserRoleFilterValue,
  type AdminUserStatusFilterValue,
} from "@/features/admin/constants/admin-table.constants";

export default function AdminUsersPage() {
  const [keyword, setKeyword] = React.useState("");
  const [searchInput, setSearchInput] = React.useState("");
  const [role, setRole] = React.useState<AdminUserRoleFilterValue>("ALL");
  const [status, setStatus] = React.useState<AdminUserStatusFilterValue>("ALL");

  const [openSections, setOpenSections] = React.useState({
    search: true,
    role: true,
    status: true,
  });

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setKeyword(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const toggleSection = React.useCallback((key: keyof typeof openSections) => {
    setOpenSections((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const clearFilters = React.useCallback(() => {
    setRole("ALL");
    setStatus("ALL");
    setSearchInput("");
    setKeyword("");
  }, []);

  const hasAppliedFilters = role !== "ALL" || status !== "ALL" || keyword.trim().length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-content-primary">User Management</h2>
        <p className="text-content-secondary">
          Manage platform users across all tenants.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-content-secondary">Filters</h2>
                <p className="text-xs text-content-muted">User controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-content-secondary hover:text-content-primary transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection title="Search" isOpen={openSections.search} onToggle={() => toggleSection("search")}>
              <SearchInput
                placeholder="Find user by email or name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 rounded-md border-theme-border bg-surface-base/70 focus:border-theme-accent focus:ring-theme-accent"
              />
            </FilterSection>

            <FilterSection title="Role" isOpen={openSections.role} onToggle={() => toggleSection("role")}>
              <div className="space-y-1">
                {ADMIN_USER_ROLE_OPTIONS.map((option) => {
                  const isActive = role === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value)}
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

            <FilterSection title="Status" isOpen={openSections.status} onToggle={() => toggleSection("status")}>
              <div className="space-y-1">
                {ADMIN_USER_STATUS_OPTIONS.map((option) => {
                  const isActive = status === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value)}
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
                {role !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-theme-accent bg-action-subtle text-theme-accent">
                    Role: {role}
                  </span>
                )}
                {status !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-status-info-border bg-status-info-surface text-status-info-text">
                    Status: {status}
                  </span>
                )}
                {keyword.trim().length > 0 && (
                  <span className="px-2 py-1 rounded-md border border-content-muted/30 bg-status-neutral-surface text-content-secondary">
                    Search: {keyword}
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

          <UserTable keyword={keyword} role={role} status={status} />
        </div>
      </section>
    </div>
  );
}
