import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { readTableVisibleColumns, writeTableVisibleColumns } from "@/lib/table-preferences";
import { NavProjectsIcon } from "@/components/icons";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { FilterSection } from "@/components/ui/filter-section";
import { Pagination } from "@/components/ui/pagination";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { ProjectStatusBadge } from "./project-status-badge";
import { Project, ProjectStatus, PaymentMethod } from "../types/project.types";
import { parseProjectsQuery } from "../query/projects-query.schema";
import {
  DEFAULT_PROJECT_VISIBLE_COLUMNS,
  DEFAULT_PROJECT_VISIBLE_COLUMNS_QUERY,
  PROJECT_COLUMN_OPTIONS,
  PROJECT_PAYMENT_OPTIONS,
  PROJECT_STATUS_LABEL_MAP,
  PROJECT_STATUS_OPTIONS,
  type ProjectPaymentFilterValue,
  type ProjectStatusFilterValue,
} from "../constants/project-table.constants";

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

const PROJECTS_TABLE_PREFERENCES_KEY = "projects.list";

export function ProjectTable({ projects, isLoading, page, totalPages, totalElements, onPageChange }: ProjectTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQueryState = parseProjectsQuery(searchParams, DEFAULT_PROJECT_VISIBLE_COLUMNS);
  const queryString = searchParams.toString();
  const [activeFilter, setActiveFilter] = React.useState<ProjectStatusFilterValue>(
    initialQueryState.statusFilter,
  );
  const [paymentFilter, setPaymentFilter] = React.useState<ProjectPaymentFilterValue>(
    initialQueryState.paymentFilter,
  );
  const [keyword, setKeyword] = React.useState(initialQueryState.keyword);
  const [openSections, setOpenSections] = React.useState({
    search: true,
    status: true,
    payment: true,
  });
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(
    initialQueryState.visibleColumns,
  );

  const filteredProjects = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus = activeFilter === "ALL" || project.status === activeFilter;
      if (!matchesStatus) return false;

      const matchesPayment = paymentFilter === "ALL" || project.paymentMethod === paymentFilter;
      if (!matchesPayment) return false;

      if (!normalizedKeyword) return true;

      const searchable = [
        project.id,
        project.title,
        project.ownerName,
        project.ownerEmail,
        project.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedKeyword);
    });
  }, [activeFilter, keyword, paymentFilter, projects]);

  const statusCounts = React.useMemo(() => {
    return projects.reduce<Partial<Record<ProjectStatus, number>>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const paymentCounts = React.useMemo(() => {
    return projects.reduce<Partial<Record<ProjectPaymentFilterValue, number>>>((acc, project) => {
      if (!project.paymentMethod) return acc;
      acc[project.paymentMethod] = (acc[project.paymentMethod] ?? 0) + 1;
      return acc;
    }, {});
  }, [projects]);

  const statusSectionOptions = React.useMemo(
    () =>
      PROJECT_STATUS_OPTIONS.map((option) => {
        const count = option.value === "ALL" ? projects.length : (statusCounts[option.value] ?? 0);
        return { ...option, count };
      }),
    [projects.length, statusCounts],
  );

  const paymentSectionOptions = React.useMemo(
    () =>
      PROJECT_PAYMENT_OPTIONS.map((option) => {
        const count = option.value === "ALL" ? projects.length : (paymentCounts[option.value] ?? 0);
        return { ...option, count };
      }),
    [projects.length, paymentCounts],
  );

  const hasAppliedFilters =
    activeFilter !== "ALL" || paymentFilter !== "ALL" || keyword.trim().length > 0;

  const clearFilters = React.useCallback(() => {
    setActiveFilter("ALL");
    setPaymentFilter("ALL");
    setKeyword("");
  }, []);

  React.useEffect(() => {
    const selectedCols = PROJECT_COLUMN_OPTIONS.filter((column) => visibleColumns[column.key])
      .map((column) => column.key)
      .join(",");

    const next = buildUpdatedQueryString(queryString, [
      { key: "status", value: activeFilter, defaultValue: "ALL" },
      { key: "payment", value: paymentFilter, defaultValue: "ALL" },
      { key: "q", value: keyword.trim() },
      { key: "cols", value: selectedCols, defaultValue: DEFAULT_PROJECT_VISIBLE_COLUMNS_QUERY },
    ]);

    if (queryString !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [activeFilter, keyword, pathname, paymentFilter, queryString, router, visibleColumns]);

  React.useEffect(() => {
    if (searchParams.get("cols")) return;

    const stored = readTableVisibleColumns(
      PROJECTS_TABLE_PREFERENCES_KEY,
      DEFAULT_PROJECT_VISIBLE_COLUMNS,
    );

    setVisibleColumns(stored);
  }, [searchParams]);

  React.useEffect(() => {
    writeTableVisibleColumns(PROJECTS_TABLE_PREFERENCES_KEY, visibleColumns);
  }, [visibleColumns]);

  const toggleSection = React.useCallback(
    (key: keyof typeof openSections) => {
      setOpenSections((current) => ({ ...current, [key]: !current[key] }));
    },
    [],
  );

  const toggleColumn = React.useCallback((key: string) => {
    const targetColumn = PROJECT_COLUMN_OPTIONS.find((column) => column.key === key);
    if (targetColumn?.locked) return;

    setVisibleColumns((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const resetColumns = React.useCallback(() => {
    setVisibleColumns(DEFAULT_PROJECT_VISIBLE_COLUMNS);
  }, []);

  const visibleColumnCount = React.useMemo(
    () => PROJECT_COLUMN_OPTIONS.filter((column) => visibleColumns[column.key]).length,
    [visibleColumns],
  );

  const renderPayment = (method?: PaymentMethod) => {
    if (!method) return <span className="text-xs text-slate-600">—</span>;
    const config: Record<PaymentMethod, { label: string; cls: string }> = {
      FIAT:           { label: "FIAT",          cls: "bg-slate-800 text-slate-400 border-slate-700" },
      CRYPTO_ESCROW:  { label: "ESCROW",        cls: "bg-violet-500/10 text-violet-400 border-violet-400/20" },
      CRYPTO_DIRECT:  { label: "CRYPTO",        cls: "bg-blue-500/10 text-blue-400 border-blue-400/20" },
    };
    const c = config[method];
    return (
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", c.cls)}>
        {c.label}
      </span>
    );
  };

  const formatBudget = (val?: string | null) =>
    val ? `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "N/A";

  const formatDeadline = (dateStr?: string | null) => {
    if (!dateStr) return "No deadline";
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) {
      return <span className="text-rose-400 font-medium">Overdue</span>;
    }
    return `In ${formatDistanceToNow(date)}`;
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
      <aside className="space-y-4 sticky top-24 z-10">
        <div className="rounded-3xl bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">Filters</h2>
              <p className="text-xs text-slate-500">Section-based project controls</p>
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
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Find project, owner, email..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-9 w-full rounded-md border border-slate-700 bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </label>
          </FilterSection>

          <FilterSection title="Status" isOpen={openSections.status} onToggle={() => toggleSection("status")}>
            <div className="space-y-1">
              {statusSectionOptions.map((option) => {
                const isActive = activeFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setActiveFilter(option.value)}
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
                    <span className="text-[11px] text-slate-500">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>

          <FilterSection title="Payment" isOpen={openSections.payment} onToggle={() => toggleSection("payment")}>
            <div className="space-y-1">
              {paymentSectionOptions.map((option) => {
                const isActive = paymentFilter === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPaymentFilter(option.value)}
                    className={`w-full flex items-center justify-between rounded-md border px-3 py-2 text-left text-xs transition-colors ${
                      isActive
                        ? "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"
                        : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-cyan-300" : "text-slate-600"}`} />
                      {option.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>
        </div>
      </aside>

      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden">
        <DataTableToolbar
          title="All Projects"
          resultCount={filteredProjects.length}
          totalCount={projects.length}
          resultLabel="projects"
          columns={PROJECT_COLUMN_OPTIONS}
          visibleColumns={visibleColumns}
          onToggleColumn={toggleColumn}
          onResetColumns={resetColumns}
        />

        {hasAppliedFilters && (
          <div className="px-6 py-3 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-300">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Applied</span>
              {activeFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
                  Status: {PROJECT_STATUS_LABEL_MAP[activeFilter]}
                </span>
              )}
              {paymentFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
                  Payment: {paymentFilter}
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

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-230 text-left">
          <thead>
            <tr className="bg-slate-900/80 border-b border-white/5">
              {visibleColumns.project && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project & Owner</th>}
              {visibleColumns.budget && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget</th>}
              {visibleColumns.status && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>}
              {visibleColumns.payment && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment</th>}
              {visibleColumns.deadline && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>}
              {visibleColumns.actions && <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={visibleColumnCount} className="px-6 py-8 text-center text-slate-500">Loading projects...</td></tr>
            ) : filteredProjects.length === 0 ? (
              <tr><td colSpan={visibleColumnCount} className="px-6 py-8 text-center text-slate-500">{activeFilter === "ALL" ? "No projects found. Create one to get started." : `No ${activeFilter.replace("_", " ").toLowerCase()} projects.`}</td></tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="group bg-slate-800/20 hover:bg-slate-800/60 ring-1 ring-transparent hover:ring-white/10 hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative">
                  {visibleColumns.project && <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
                        <NavProjectsIcon className="size-5 text-slate-400" />
                      </div>
                      <div>
                        <Link href={`/projects/${project.id}`}>
                          <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{project.title}</p>
                        </Link>
                        <p className="text-xs text-slate-500 font-medium">{project.ownerName}</p>
                      </div>
                    </div>
                  </td>}
                  {visibleColumns.budget && <td className="px-6 py-5"><span className="text-sm font-mono font-bold text-white">{formatBudget(project.budget)}</span></td>}
                  {visibleColumns.status && <td className="px-6 py-5"><ProjectStatusBadge status={project.status} /></td>}
                  {visibleColumns.payment && <td className="px-6 py-5">{renderPayment(project.paymentMethod)}</td>}
                  {visibleColumns.deadline && <td className="px-6 py-5"><span className="text-xs text-slate-500">{formatDeadline(project.deadline)}</span></td>}
                  {visibleColumns.actions && <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <RowActionMenu
                        items={[
                          {
                            key: "view-details",
                            label: "View Details",
                            href: `/projects/${project.id}`,
                          },
                          {
                            key: "go-to-invoices",
                            label: "Go to Invoices",
                            href: `/invoices?projectId=${project.id}`,
                          },
                          {
                            key: "open-project",
                            label: "Open Project",
                            href: `/projects/${project.id}`,
                          },
                        ]}
                      />
                    </div>
                  </td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {!isLoading && projects.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            totalElements={hasAppliedFilters ? filteredProjects.length : totalElements}
            onPageChange={onPageChange}
            label="projects"
          />
        )}
      </div>
    </section>
  );
}