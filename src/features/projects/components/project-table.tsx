import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { NavProjectsIcon } from "@/components/icons";
import { Project, ProjectStatus, PaymentMethod } from "../types/project.types";

interface ProjectTableProps {
  projects: Project[];
  isLoading: boolean;
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (newPage: number) => void;
}

type FilterValue = ProjectStatus | "ALL";

const FILTER_PILLS: { label: string; value: FilterValue }[] = [
  { label: "All",        value: "ALL" },
  { label: "Planning",   value: ProjectStatus.PLANNING },
  { label: "In Progress",value: ProjectStatus.IN_PROGRESS },
  { label: "On Hold",    value: ProjectStatus.ON_HOLD },
  { label: "Completed",  value: ProjectStatus.COMPLETED },
];

export function ProjectTable({ projects, isLoading, page, totalPages, totalElements, onPageChange }: ProjectTableProps) {
  const [activeFilter, setActiveFilter] = React.useState<FilterValue>("ALL");

  const filteredProjects =
    activeFilter === "ALL" ? projects : projects.filter((p) => p.status === activeFilter);

  const renderStatus = (status: ProjectStatus) => {
    const config: Record<ProjectStatus, { color: string; bg: string; dot: string; label: string }> = {
      [ProjectStatus.PLANNING]: { color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20", dot: "bg-slate-400", label: "Planning" },
      [ProjectStatus.IN_PROGRESS]: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-400/20", dot: "bg-blue-400", label: "In Progress" },
      [ProjectStatus.ON_HOLD]: { color: "text-amber-400", bg: "bg-amber-500/10 border-amber-400/20", dot: "bg-amber-400", label: "On Hold" },
      [ProjectStatus.COMPLETED]: { color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-400/20", dot: "bg-emerald-400", label: "Completed" },
      [ProjectStatus.CANCELLED]: { color: "text-rose-400", bg: "bg-rose-500/10 border-rose-400/20", dot: "bg-rose-400", label: "Cancelled" },
    };
    const c = config[status] || config[ProjectStatus.PLANNING];
    return (
      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border", c.bg, c.color)}>
        <span className={cn("w-1 h-1 rounded-full mr-2", c.dot)}></span>
        {c.label}
      </span>
    );
  };

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
    <section className="bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="font-bold text-sm uppercase tracking-wider text-slate-400">All Projects</h2>
        <div className="hidden sm:flex gap-2">
          {FILTER_PILLS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setActiveFilter(value)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors",
                activeFilter === value
                  ? "bg-emerald-500 text-white"
                  : "border border-slate-700 hover:bg-white/5 text-slate-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-800">
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project & Owner</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Budget</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Payment</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
              <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {isLoading ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">Loading projects...</td></tr>
            ) : filteredProjects.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">{activeFilter === "ALL" ? "No projects found. Create one to get started." : `No ${activeFilter.replace("_", " ").toLowerCase()} projects.`}</td></tr>
            ) : (
              filteredProjects.map((project) => (
                <tr key={project.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-5">
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
                  </td>
                  <td className="px-6 py-5"><span className="text-sm font-mono font-bold text-white">{formatBudget(project.budget)}</span></td>
                  <td className="px-6 py-5">{renderStatus(project.status)}</td>
                  <td className="px-6 py-5">{renderPayment(project.paymentMethod)}</td>
                  <td className="px-6 py-5"><span className="text-xs text-slate-500">{formatDeadline(project.deadline)}</span></td>
                  <td className="px-6 py-5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/invoices?projectId=${project.id}`}
                        className="text-[11px] font-bold text-slate-400 hover:text-white transition-colors"
                      >
                        Go to Invoices
                      </Link>
                      <Link href={`/projects/${project.id}`}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold px-4 py-2 rounded-lg transition-all"
                      >
                        View Details
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && projects.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Page {page + 1} of {totalPages} ({totalElements} total)
          </p>
          <div className="flex gap-1">
            <button 
              disabled={page === 0}
              onClick={() => onPageChange(page - 1)}
              className="px-3 h-8 flex items-center justify-center rounded hover:bg-white/5 text-slate-400 text-xs font-bold disabled:opacity-50"
            >
              Prev
            </button>
            <button 
              disabled={page >= totalPages - 1}
              onClick={() => onPageChange(page + 1)}
              className="px-3 h-8 flex items-center justify-center rounded hover:bg-white/5 text-slate-400 text-xs font-bold disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </section>
  );
}