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
        <h2 className="text-3xl font-bold tracking-tight text-white">User Management</h2>
        <p className="text-slate-400">
          Manage platform users across all tenants.
        </p>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
        <aside className="space-y-4 sticky top-24 z-10">
          <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
                <p className="text-xs text-slate-500">User controls</p>
              </div>
              <button
                type="button"
                onClick={clearFilters}
                className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
              >
                Reset
              </button>
            </div>

            <FilterSection title="Search" isOpen={openSections.search} onToggle={() => toggleSection("search")}>
              <SearchInput
                placeholder="Find user by email or name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 rounded-md border-slate-700 bg-slate-950/70 focus:border-emerald-500/50 focus:ring-emerald-500/50"
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
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                          : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <span className="inline-flex items-center gap-2">
                        <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-blue-300" : "text-slate-600"}`} />
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
                {role !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                    Role: {role}
                  </span>
                )}
                {status !== "ALL" && (
                  <span className="px-2 py-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-300">
                    Status: {status}
                  </span>
                )}
                {keyword.trim().length > 0 && (
                  <span className="px-2 py-1 rounded-md border border-slate-500/30 bg-slate-500/10 text-slate-300">
                    Search: {keyword}
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

          <UserTable keyword={keyword} role={role} status={status} />
        </div>
      </section>
    </div>
  );
}
