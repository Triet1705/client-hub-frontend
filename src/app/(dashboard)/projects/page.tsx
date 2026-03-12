"use client";

import * as React from "react";
import { Plus } from "lucide-react";
import { ProjectStats } from "@/features/projects/components/project-stats";
import { ProjectTable } from "@/features/projects/components/project-table";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { ProjectStatus } from "@/features/projects/types/project.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useDashboardStatsQuery } from "@/features/dashboard/hooks/use-dashboard";
import { CreateProjectModal } from "@/features/projects/components/create-project-modal";

export default function ProjectsPage() {
  const [page, setPage] = React.useState(0);
  const pageSize = 10;
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const { user } = useAuthStore();
  const canCreate = user?.role === "CLIENT" || user?.role === "ADMIN";

  const { data, isLoading, isError } = useProjectsQuery(page, pageSize);
  const { data: statsData } = useDashboardStatsQuery();

  const projects = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  const activeProjects = projects.filter(
    (p) => p.status === ProjectStatus.IN_PROGRESS || p.status === ProjectStatus.PLANNING
  ).length;

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const now = new Date();
  const upcomingDeadlines = projects.filter((p) => {
    if (!p.deadline) return false;
    const d = new Date(p.deadline);
    return d >= now && d <= thirtyDaysFromNow;
  }).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px]">
      
      <ProjectStats
        isLoading={isLoading}
        activeProjects={activeProjects}
        awaitingPaymentAmount={statsData?.awaitingPaymentAmount ?? "0"}
        upcomingDeadlines={upcomingDeadlines}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 text-sm">Manage your active engagements</p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-900/20"
          >
            <Plus className="w-5 h-5" />
            Create Project
          </button>
        )}
      </div>

      {isError ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400">
          Failed to load projects. Please try again.
        </div>
      ) : (
        <ProjectTable 
          projects={projects}
          isLoading={isLoading}
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={setPage}
        />
      )}
      <CreateProjectModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

    </div>
  );
}