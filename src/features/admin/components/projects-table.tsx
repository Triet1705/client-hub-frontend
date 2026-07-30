import * as React from "react";
import { useAdminProjectsQuery } from "@/features/admin/hooks/use-admin";
import { Pagination } from "@/components/ui/pagination";
import { format } from "date-fns";
import type { AdminProjectStatusFilterValue } from "@/features/admin/constants/admin-table.constants";
import type { AdminProject } from "../types/admin.types";
import { AdminProjectDetailSlideover } from "./admin-project-detail-slideover";

interface ProjectsTableProps {
  status: AdminProjectStatusFilterValue;
}

export function ProjectsTable({ status }: ProjectsTableProps) {
  const [page, setPage] = React.useState(0);
  const [selectedProject, setSelectedProject] = React.useState<AdminProject | null>(null);

  const { data, isLoading, isError } = useAdminProjectsQuery({
    page,
    size: 20,
    sortBy: "createdAt",
    sortDir: "desc",
  });

  const filteredProjects = React.useMemo(() => {
    if (!data?.content) return [];
    if (status === "ALL") return data.content;
    return data.content.filter((p) => p.status === status);
  }, [data, status]);

  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-base/40 text-[10px] font-bold uppercase tracking-widest text-content-muted border-b border-theme-border">
              <tr>
                <th className="px-6 py-4 font-medium">Project Title</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Tenant</th>
                <th className="px-6 py-4 font-medium">Owner</th>
                <th className="px-6 py-4 font-medium">Budget</th>
                <th className="px-6 py-4 font-medium">Created</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme-border">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <tr key={index}>
                  <td colSpan={7} className="px-6 py-4">
                    <div className="h-6 w-full animate-pulse rounded bg-surface-elevated/50" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-sm font-medium text-content-secondary">
                      Failed to load data
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="text-xs font-bold text-theme-accent hover:text-theme-accent transition-colors"
                    >
                      Try again
                    </button>
                  </div>
                </td>
              </tr>
            ) : filteredProjects.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-content-muted">
                  No projects found.
                </td>
              </tr>
            ) : (
              filteredProjects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelectedProject(p)}
                  className="group bg-surface-elevated/20 hover:bg-surface-elevated/60 ring-1 ring-transparent hover:ring-theme-border hover:-translate-y-px transition-all duration-300 hover:shadow-xl hover:z-10 relative cursor-pointer"
                >
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-content-primary group-hover:text-theme-accent transition-colors">{p.title}</p>
                    <p className="text-xs text-content-muted font-mono mt-0.5">{p.id}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-surface-elevated text-content-secondary uppercase ring-1 ring-theme-border">
                      {p.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-content-muted font-mono text-xs">{p.tenantId}</td>
                  <td className="px-6 py-5">
                    <p className="font-medium text-content-secondary">{p.ownerName || "—"}</p>
                    <p className="text-xs text-content-muted">{p.ownerEmail || "—"}</p>
                  </td>
                  <td className="px-6 py-5 font-mono text-sm font-bold text-theme-accent">
                    ${Number(p.budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-5 text-xs text-content-muted">
                    {format(new Date(p.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedProject(p); }}
                      className="text-theme-accent hover:text-theme-accent text-xs font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      View
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
          label="projects"
        />
      )}

      {selectedProject && (
        <AdminProjectDetailSlideover
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </>
  );
}
