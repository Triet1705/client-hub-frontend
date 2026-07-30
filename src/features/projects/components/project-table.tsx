import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { CircleDot, Search } from "lucide-react";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { readTableVisibleColumns, writeTableVisibleColumns } from "@/lib/table-preferences";
import { NavProjectsIcon } from "@/components/icons";
import { DataTableToolbar } from "@/components/ui/data-table-toolbar";
import { FilterSection } from "@/components/ui/filter-section";
import { Pagination } from "@/components/ui/pagination";
import { RowActionMenu } from "@/components/ui/row-action-menu";
import { ProjectStatusBadge } from "./project-status-badge";
import { Project, ProjectStatus } from "../types/project.types";
import { parseProjectsQuery } from "../query/projects-query.schema";
import {
  DEFAULT_PROJECT_VISIBLE_COLUMNS,
  DEFAULT_PROJECT_VISIBLE_COLUMNS_QUERY,
  PROJECT_COLUMN_OPTIONS,
  PROJECT_STATUS_LABEL_MAP,
  PROJECT_STATUS_OPTIONS,
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
  const [keyword, setKeyword] = React.useState(initialQueryState.keyword);
  const [openSections, setOpenSections] = React.useState({
    search: true,
    status: true,
  });
  const [visibleColumns, setVisibleColumns] = React.useState<Record<string, boolean>>(
    initialQueryState.visibleColumns,
  );

  const filteredProjects = React.useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesStatus = activeFilter === "ALL" || project.status === activeFilter;
      if (!matchesStatus) return false;

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
  }, [activeFilter, keyword, projects]);

  const statusCounts = React.useMemo(() => {
    return projects.reduce<Partial<Record<ProjectStatus, number>>>((acc, project) => {
      acc[project.status] = (acc[project.status] ?? 0) + 1;
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

  const hasAppliedFilters =
    activeFilter !== "ALL" || keyword.trim().length > 0;

  const clearFilters = React.useCallback(() => {
    setActiveFilter("ALL");
    setKeyword("");
  }, []);

  React.useEffect(() => {
    const selectedCols = PROJECT_COLUMN_OPTIONS.filter((column) => visibleColumns[column.key])
      .map((column) => column.key)
      .join(",");

    const next = buildUpdatedQueryString(queryString, [
      { key: "status", value: activeFilter, defaultValue: "ALL" },
      { key: "q", value: keyword.trim() },
      { key: "cols", value: selectedCols, defaultValue: DEFAULT_PROJECT_VISIBLE_COLUMNS_QUERY },
    ]);

    if (queryString !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [activeFilter, keyword, pathname, queryString, router, visibleColumns]);

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


  const formatBudget = (val?: string | null) =>
    val ? `$${parseFloat(val).toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "N/A";

  const formatDeadline = (dateStr?: string | null) => {
    if (!dateStr) return "No deadline";
    const date = new Date(dateStr);
    const now = new Date();
    if (date < now) {
      return <span className="text-status-danger-text font-medium">Overdue</span>;
    }
    return `In ${formatDistanceToNow(date)}`;
  };

  return (
    <section className="grid grid-cols-1 xl:grid-cols-[18rem_minmax(0,1fr)] gap-6 items-start">
      <aside className="space-y-4 sticky top-24 z-10">
        <div className="rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-theme p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-content-secondary">Filters</h2>
              <p className="text-xs text-content-muted">Section-based project controls</p>
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
            <label className="relative block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-content-muted" />
              <input
                type="text"
                placeholder="Find project, owner, email..."
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                className="h-9 w-full rounded-md border border-theme-border bg-surface-base/70 pl-10 pr-3 text-sm text-content-primary placeholder:text-content-muted focus:border-theme-accent focus:outline-none focus:ring-1 focus:ring-theme-accent"
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
                        ? "border-theme-accent bg-action-subtle text-theme-accent"
                        : "border-theme-border bg-surface/60 text-content-secondary hover:border-theme-border"
                    }`}
                  >
                    <span className="inline-flex items-center gap-2">
                      <CircleDot className={`h-3.5 w-3.5 ${isActive ? "text-theme-accent" : "text-content-muted"}`} />
                      {option.label}
                    </span>
                    <span className="text-[11px] text-content-muted">{option.count}</span>
                  </button>
                );
              })}
            </div>
          </FilterSection>


        </div>
      </aside>

      <div className="bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-theme rounded-3xl overflow-hidden">
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
          <div className="px-6 py-3 border-b border-theme-border bg-surface-base/40 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs text-content-secondary">
              <span className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Applied</span>
              {activeFilter !== "ALL" && (
                <span className="px-2 py-1 rounded-md border border-theme-accent bg-action-subtle text-theme-accent">
                  Status: {PROJECT_STATUS_LABEL_MAP[activeFilter]}
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

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full min-w-230 text-left">
          <thead>
            <tr className="bg-surface/80 border-b border-theme-border">
              {visibleColumns.project && <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Project & Owner</th>}
              {visibleColumns.budget && <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Budget</th>}
              {visibleColumns.status && <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Status</th>}
              {visibleColumns.deadline && <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest">Deadline</th>}
              {visibleColumns.actions && <th className="px-6 py-4 text-[10px] font-bold text-content-muted uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-theme-border">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={visibleColumnCount} className="px-6 py-5">
                    <div className="h-6 w-full animate-pulse rounded bg-surface-elevated/50" />
                  </td>
                </tr>
              ))
            ) : filteredProjects.length === 0 ? (
              <tr><td colSpan={visibleColumnCount} className="px-6 py-8 text-center text-content-muted">{activeFilter === "ALL" ? "No projects found. Create one to get started." : `No ${activeFilter.replace("_", " ").toLowerCase()} projects.`}</td></tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="group bg-surface-elevated/20 hover:bg-surface-elevated/60 ring-1 ring-transparent hover:ring-theme-border hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative">
                  {visibleColumns.project && <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-surface-elevated flex items-center justify-center border border-theme-border">
                        <NavProjectsIcon className="size-5 text-content-secondary" primaryColor="currentColor" accentColor="currentColor" />
                      </div>
                      <div>
                        <Link href={`/projects/${project.id}`}>
                          <p className="text-sm font-bold text-content-primary group-hover:text-theme-accent transition-colors">{project.title}</p>
                        </Link>
                        <p className="text-xs text-content-muted font-medium">{project.ownerName}</p>
                      </div>
                    </div>
                  </td>}
                  {visibleColumns.budget && <td className="px-6 py-5"><span className="text-sm font-mono font-bold text-content-primary">{formatBudget(project.budget)}</span></td>}
                  {visibleColumns.status && <td className="px-6 py-5"><ProjectStatusBadge status={project.status} /></td>}
                  {visibleColumns.deadline && <td className="px-6 py-5"><span className="text-xs text-content-muted">{formatDeadline(project.deadline)}</span></td>}
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
