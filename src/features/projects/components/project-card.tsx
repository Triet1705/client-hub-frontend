import Link from "next/link";
import { Project } from "../types/project.types";
import { ProjectStatusBadge } from "./project-status-badge";
import { ActionEditIcon, ActionDeleteIcon, NavProjectsIcon } from "@/components/icons";

import { formatFiat } from "@/lib/utils";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const isOverdue = project.deadline && new Date(project.deadline) < new Date();

  return (
    <div className="group bg-surface/50 backdrop-blur-sm border border-theme-border rounded-2xl p-5 hover:border-theme-border transition-all flex flex-col h-full relative overflow-hidden">

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-elevated/50 rounded-lg text-content-secondary group-hover:text-theme-accent group-hover:bg-action-subtle transition-colors">
            <NavProjectsIcon className="w-5 h-5" primaryColor="currentColor" accentColor="currentColor" />
          </div>
          <div>
            <Link href={`/projects/${project.id}`} className="block">
              <h3 className="text-content-primary font-medium text-lg leading-tight hover:text-theme-accent transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
            <p className="text-content-muted text-xs mt-0.5">by {project.ownerName}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.preventDefault(); onEdit?.(project); }}
            className="p-1.5 text-content-secondary hover:text-status-info-text hover:bg-status-info-surface rounded-md transition-colors"
          >
            <ActionEditIcon className="w-4 h-4" primaryColor="currentColor" accentColor="currentColor" />
          </button>
          <button
            onClick={(e) => { e.preventDefault(); onDelete?.(project); }}
            className="p-1.5 text-content-secondary hover:text-status-danger-text hover:bg-status-danger-surface rounded-md transition-colors"
          >
            <ActionDeleteIcon className="w-4 h-4" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>
      </div>

      <p className="text-content-secondary text-sm line-clamp-2 mb-6 flex-1">
        {project.description || "No description provided."}
      </p>

      <div className="pt-4 border-t border-theme-border/50 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-content-muted font-bold">Budget</span>
          <span className="text-sm font-medium text-content-primary">{formatFiat(project.budget)}</span>
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-wider text-content-muted font-bold">Status</span>
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      {isOverdue && project.status !== "COMPLETED" && project.status !== "CANCELLED" && (
        <div className="absolute top-0 right-0 border-t-30 border-r-30 border-t-rose-500 border-r-transparent">
           <span className="absolute -top-6.5 right-1 text-content-primary text-[10px] font-bold" title="Overdue">!</span>
        </div>
      )}
    </div>
  );
}
