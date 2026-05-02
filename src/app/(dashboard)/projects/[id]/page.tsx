"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, DollarSign, Plus, Users, Receipt, Trash2, FolderGit2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { TaskStatus, type Task } from "@/features/tasks/types/task.types";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks";
import {
  useProjectDetailQuery,
  useProjectMembersQuery,
  useProjectInvoicesQuery,
  useAddMemberMutation,
  useRemoveMemberMutation,
} from "@/features/projects/hooks/use-projects";
import { ProjectStatusBadge } from "@/features/projects/components/project-status-badge";
import { TaskDetailSlideover } from "@/features/projects/components/task-detail-slideover";
import { AddMemberModal } from "@/features/projects/components/add-member-modal";
import { SmartUploadSlideover } from "@/features/smart-tasks/components/smart-upload-slideover";
import { useQueryClient } from "@tanstack/react-query";

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const { user } = useAuthStore();
  const role = user?.role;
  const canManageProject = role === "CLIENT" || role === "ADMIN";
  const queryClient = useQueryClient();

  const { data: project, isLoading: isProjectLoading, isError: isProjectError } = useProjectDetailQuery(projectId);
  const { data: members = [], isLoading: isMembersLoading } = useProjectMembersQuery(projectId);
  const { data: invoices = [], isLoading: isInvoicesLoading } = useProjectInvoicesQuery(projectId);

  const taskParams = React.useMemo(
    () => ({ projectId, page: 0, size: 50 }),
    [projectId],
  );
  const { data: tasksPage, isLoading: isTasksLoading, isError: isTasksError } = useTasksQuery(taskParams);
  const tasks = tasksPage?.content ?? [];

  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState(TaskStatus.TODO);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [isAddMemberOpen, setIsAddMemberOpen] = React.useState(false);
  const [isSmartUploadOpen, setIsSmartUploadOpen] = React.useState(false);

  const { mutate: addMember, isPending: isAddingMember } = useAddMemberMutation(projectId);
  const { mutate: removeMember, isPending: isRemovingMember } = useRemoveMemberMutation(projectId);

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateTaskModalOpen(true);
  };

  const handleAddMember = (userId: string) => {
    addMember(userId, {
      onSuccess: () => setIsAddMemberOpen(false),
    });
  };

  if (isProjectLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] w-full">
        <div className="h-40 rounded-3xl bg-slate-900/60 ring-1 ring-white/5 animate-pulse" />
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
           <div className="xl:col-span-8 h-[600px] rounded-3xl bg-slate-900/60 ring-1 ring-white/5 animate-pulse" />
           <div className="xl:col-span-4 h-[600px] rounded-3xl bg-slate-900/60 ring-1 ring-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-rose-300 max-w-2xl text-center mx-auto mt-20 ring-1 ring-rose-500/30 shadow-2xl shadow-rose-500/10">
        <h2 className="text-xl font-bold font-space-grotesk tracking-tight text-rose-100 mb-2">Access Denied or Project Missing</h2>
        <p className="text-sm">The requested metadata could not be verified in the ledger. Please ensure you have payload access.</p>
        <Link href="/projects" className="inline-block mt-6 px-5 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 rounded-xl transition-colors font-bold text-rose-100 text-sm">Return to Directory</Link>
      </div>
    );
  }

  const canManageMembers = role === "ADMIN" || (!!user?.id && project.ownerId === user.id);

  return (
    <div className="space-y-6 max-w-[1600px] w-full animate-in fade-in slide-in-from-bottom-4 duration-500 font-body">
      {/* Back link */}
      <Link href="/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors">
        <ArrowLeft size={14} /> Back to Directory
      </Link>

      {/* 1. Hero Bento Card */}
      <div className="bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl p-6 md:p-8 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full group-hover:bg-emerald-500/15 transition-colors duration-700" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 ring-1 ring-emerald-500/20 rounded-2xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <FolderGit2 className="w-6 h-6" />
              </div>
              <ProjectStatusBadge status={project.status} />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-space-grotesk font-bold text-white tracking-tight drop-shadow-sm">{project.title}</h1>
            
            <div className="flex items-center gap-4 text-sm text-slate-400 font-medium flex-wrap pt-2">
              <span className="flex items-center gap-2 bg-slate-950/50 p-1.5 pr-4 rounded-xl ring-1 ring-white/5">
                <div className="p-1.5 bg-slate-900 rounded-lg text-slate-400 ring-1 ring-white/5 shadow-inner"><Calendar className="w-4 h-4" /></div>
                {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}
              </span>
              {canManageProject && (
                <span className="flex items-center gap-2 bg-slate-950/50 p-1.5 pr-4 rounded-xl ring-1 ring-white/5">
                  <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 ring-1 ring-emerald-500/20 shadow-inner"><DollarSign className="w-4 h-4" /></div>
                  <span className="text-slate-200 font-mono tracking-wide">{project.budget ? Number(project.budget).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "N/A"}</span>
                </span>
              )}
              <span className="flex items-center gap-2 bg-slate-950/50 p-1.5 pr-4 rounded-xl ring-1 ring-white/5">
                <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400 ring-1 ring-blue-500/20 shadow-inner"><Users className="w-4 h-4" /></div>
                Owner: <span className="text-slate-200 font-bold">{project.ownerName || project.ownerEmail}</span>
              </span>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => setIsSmartUploadOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 text-sm font-bold transition-all shadow-lg shadow-indigo-900/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Sparkles size={16} className="text-indigo-400" />
              Smart Upload
            </button>
            <button
              onClick={() => handleAddTask(TaskStatus.TODO)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        <section className="xl:col-span-8 lg:col-span-12 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden flex flex-col min-h-[600px] h-full">
          <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between bg-slate-950/40 shrink-0">
            <div>
              <h2 className="text-sm font-space-grotesk font-bold uppercase tracking-widest text-slate-300">Mission Control</h2>
              <p className="text-xs text-slate-500 mt-0.5">Drag and drop tasks by status</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 font-mono">{tasks.length} Active</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-hidden">
            {isTasksError ? (
              <div className="m-6 p-5 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm text-center">
                Failed to load tasks for this project.
              </div>
            ) : isTasksLoading ? (
              <div className="p-6 h-full flex gap-4">
                 {[1,2,3].map(i => <div key={i} className="flex-1 rounded-2xl bg-slate-800/50 ring-1 ring-white/5 shadow-inner animate-pulse" />)}
              </div>
            ) : (
              <TaskBoard tasks={tasks} currentParams={taskParams} onAddTask={handleAddTask} onTaskClick={setSelectedTask} />
            )}
          </div>
        </section>

        <aside className="xl:col-span-4 lg:col-span-12 flex xl:flex-col lg:flex-row flex-col gap-6">
          
          <section className="flex-1 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden group">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative overflow-hidden bg-slate-950/40">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-2xl pointer-events-none rounded-full group-hover:bg-blue-500/20 transition-colors" />
              <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 relative z-10">
                <Users size={14} className="text-blue-400" /> Crew Manifest
              </h3>
              {canManageMembers && (
                <button
                  onClick={() => setIsAddMemberOpen(true)}
                  className="text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest relative z-10 px-2.5 py-1 bg-emerald-500/10 rounded-lg ring-1 ring-emerald-500/20 shadow-md hover:shadow-emerald-500/20"
                >
                  + Enroll
                </button>
              )}
            </div>
            
            <div className="p-5 flex gap-3 flex-col items-stretch max-h-[350px] overflow-y-auto custom-scrollbar">
              {isMembersLoading ? (
                <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}</div>
              ) : members.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-6 font-bold uppercase tracking-widest">No payload specialists assigned.</p>
              ) : (
                members.map((member) => {
                  const initials = (member.fullName || member.email).slice(0, 2).toUpperCase();
                  const isFreelancer = member.role === "FREELANCER";
                  const roleClass = isFreelancer ? "text-emerald-400" : member.role === "CLIENT" ? "text-blue-400 " : "text-amber-400 ";
                  const roleBg = isFreelancer ? "bg-emerald-500/10 border-emerald-500/20" : member.role === "CLIENT" ? "bg-blue-500/10 border-blue-500/20" : "bg-amber-500/10 border-amber-500/20";
                  
                  return (
                    <div key={member.userId} className="flex items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-800/40 ring-1 ring-white/5 hover:bg-slate-800/80 transition-all shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] hover:-translate-y-px duration-300 group/member">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center text-[11px] font-space-grotesk font-bold text-white shadow-inner relative overflow-hidden", isFreelancer ? "bg-emerald-950 border-b-2 border-emerald-500" : "bg-blue-950 border-b-2 border-blue-500")}>
                          <div className={cn("absolute inset-0 opacity-20", isFreelancer ? "bg-emerald-500" : "bg-blue-500")} />
                          <span className="relative z-10">{initials}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate leading-tight group-hover/member:text-emerald-50 transition-colors">{member.fullName || member.email}</p>
                          <span className={cn("text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded border mt-1 inline-block", roleClass, roleBg)}>
                            {member.role}
                          </span>
                        </div>
                      </div>
                      {canManageMembers && isFreelancer && (
                        <button onClick={() => removeMember(member.userId)} disabled={isRemovingMember} className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 ring-1 ring-transparent hover:ring-rose-500/20 transition-all shrink-0 outline-none">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="flex-1 bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 rounded-3xl overflow-hidden group flex flex-col">
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between relative overflow-hidden bg-slate-950/40 shrink-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-amber-500/10 blur-2xl pointer-events-none rounded-full group-hover:bg-amber-500/20 transition-colors" />
              <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300 relative z-10">
                <Receipt size={14} className="text-amber-400" /> Operational Ledgers
              </h3>
              <Link href={`/invoices?projectId=${projectId}`} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-widest relative z-10 bg-amber-500/10 px-2.5 py-1 rounded-lg ring-1 ring-amber-500/20 shadow-md">
                View All
              </Link>
            </div>
            
            <div className="p-5 space-y-3 flex-1 overflow-y-auto custom-scrollbar">
              {isInvoicesLoading ? (
                 <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)}</div>
              ) : invoices.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50 space-y-3 py-6">
                   <Receipt className="w-8 h-8 text-slate-500" />
                   <p className="text-xs text-slate-400 uppercase tracking-widest font-bold">No active ledgers</p>
                </div>
              ) : (
                invoices.slice(0, 4).map((invoice) => {
                  const isPaid = invoice.status === "PAID";
                  const isOverdue = invoice.status === "OVERDUE";
                  const isLocked = invoice.status === "LOCKED";
                  
                  return (
                    <div key={invoice.id} className="rounded-2xl border border-white/5 bg-slate-800/40 p-4 hover:bg-slate-800/80 transition-all cursor-pointer group/inv hover:shadow-xl hover:-translate-y-px">
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-[11px] font-mono text-slate-400 group-hover/inv:text-white transition-colors tracking-tight">#{invoice.id}</span>
                        <span className={cn(
                          "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-md border shadow-inner",
                          isPaid ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" :
                          isOverdue ? "text-rose-400 bg-rose-500/10 border-rose-500/20" :
                          isLocked ? "text-indigo-400 bg-indigo-500/10 border-indigo-500/20" :
                          "text-amber-400 bg-amber-500/10 border-amber-500/20"
                        )}>{invoice.status}</span>
                      </div>
                      <p className="text-2xl font-space-grotesk font-bold text-white tracking-tight">
                        {Number(invoice.amount).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </aside>
      </div>

      <CreateTaskModal isOpen={isCreateTaskModalOpen} onClose={() => setIsCreateTaskModalOpen(false)} defaultStatus={defaultStatus} />

      <AddMemberModal
        isOpen={isAddMemberOpen}
        projectId={projectId}
        currentMemberIds={members.map((member) => member.userId)}
        isPending={isAddingMember}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
      />

      <TaskDetailSlideover
        task={selectedTask}
        isClient={canManageProject}
        projectMembers={members}
        projectParams={taskParams}
        currentUserId={user?.id}
        onClose={() => setSelectedTask(null)}
      />

      <SmartUploadSlideover
        isOpen={isSmartUploadOpen}
        projectId={projectId}
        onClose={() => setIsSmartUploadOpen(false)}
        onTasksCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks", { projectId }] });
        }}
      />
    </div>
  );
}
