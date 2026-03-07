import Link from "next/link";
import { Project } from "../types/project.types";
import { ProjectStatusBadge } from "./project-status-badge";
import { ActionEditIcon, ActionDeleteIcon, NavProjectsIcon } from "@/components/icons";

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const formatBudget = (budgetStr?: string | null) => {
    if (!budgetStr) return "N/A";
    const num = parseFloat(budgetStr);
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const isOverdue = project.deadline && new Date(project.deadline) < new Date();

  return (
    <div className="group bg-[#0f172a]/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col h-full relative overflow-hidden">
      
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-800/50 rounded-lg text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
            <NavProjectsIcon className="w-5 h-5" />
          </div>
          <div>
            <Link href={`/projects/${project.id}`} className="block">
              <h3 className="text-white font-medium text-lg leading-tight hover:text-emerald-400 transition-colors line-clamp-1">
                {project.title}
              </h3>
            </Link>
            <p className="text-slate-500 text-xs mt-0.5">by {project.ownerName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.preventDefault(); onEdit?.(project); }}
            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors"
          >
            <ActionEditIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => { e.preventDefault(); onDelete?.(project); }}
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
          >
            <ActionDeleteIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-slate-400 text-sm line-clamp-2 mb-6 flex-1">
        {project.description || "No description provided."}
      </p>

      <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between mt-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Budget</span>
          <span className="text-sm font-medium text-white">{formatBudget(project.budget)}</span>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Status</span>
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>

      {isOverdue && project.status !== "COMPLETED" && project.status !== "CANCELLED" && (
        <div className="absolute top-0 right-0 border-t-30 border-r-30 border-t-rose-500 border-r-transparent">
           <span className="absolute -top-6.5 right-1 text-white text-[10px] font-bold" title="Overdue">!</span>
        </div>
      )}
    </div>
  );
}