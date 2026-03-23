"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Calendar, DollarSign, Plus, Users, Receipt, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OperationsDetailLayout } from "@/components/layout/operations-detail-layout";
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

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const projectId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";

  const { user } = useAuthStore();
  const role = user?.role;
  const canManageProject = role === "CLIENT" || role === "ADMIN";

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
      <div className="space-y-6">
        <div className="h-8 w-72 rounded bg-slate-800/60 animate-pulse" />
        <div className="h-140 rounded-2xl border border-slate-800 bg-slate-900/30 animate-pulse" />
      </div>
    );
  }

  if (isProjectError || !project) {
    return (
      <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">
        Project not found or you do not have access.
      </div>
    );
  }

  const canManageMembers = role === "ADMIN" || (!!user?.id && project.ownerId === user.id);

  return (
    <div className="space-y-6 max-w-350">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Projects
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{project.title}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>

          <div className="flex items-center gap-5 text-xs text-slate-400 flex-wrap">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} />
              {project.deadline ? format(new Date(project.deadline), "MMM d, yyyy") : "No deadline"}
            </span>
            {canManageProject && (
              <span className="inline-flex items-center gap-1.5">
                <DollarSign size={13} />
                {project.budget ? Number(project.budget).toLocaleString("en-US", { style: "currency", currency: "USD" }) : "N/A"}
              </span>
            )}
            <span>Owner: {project.ownerName || project.ownerEmail}</span>
          </div>
        </div>

        <button
          onClick={() => handleAddTask(TaskStatus.TODO)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      <OperationsDetailLayout
        main={(
          <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Tasks</h2>
                <p className="text-xs text-slate-500 mt-1">Drag and drop tasks by status</p>
              </div>
              <div className="text-xs text-slate-500 font-mono">{tasks.length} total</div>
            </div>

            {isTasksError ? (
              <div className="m-6 p-5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-300 text-sm">
                Failed to load tasks for this project.
              </div>
            ) : isTasksLoading ? (
              <div className="flex-1 p-6">
                <div className="h-full rounded-xl bg-slate-900/30 animate-pulse" />
              </div>
            ) : (
              <TaskBoard
                tasks={tasks}
                currentParams={taskParams}
                onAddTask={handleAddTask}
                onTaskClick={setSelectedTask}
              />
            )}
          </section>
        )}
        sidebar={(
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Users size={14} />
                  Members
                </h3>
                {canManageMembers && (
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    + Add Member
                  </button>
                )}
              </div>

              <div className="p-4 space-y-3">
                {isMembersLoading ? (
                  <p className="text-xs text-slate-500">Loading members...</p>
                ) : members.length === 0 ? (
                  <p className="text-xs text-slate-500">No members yet.</p>
                ) : (
                  members.map((member) => {
                    const initials = (member.fullName || member.email).slice(0, 2).toUpperCase();
                    const roleClass =
                      member.role === "FREELANCER"
                        ? "text-emerald-400"
                        : member.role === "CLIENT"
                          ? "text-blue-400"
                          : "text-amber-400";

                    return (
                      <div key={member.userId} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-slate-200 truncate">{member.fullName || member.email}</p>
                            <p className={cn("text-[10px] font-bold uppercase tracking-wider", roleClass)}>
                              {member.role}
                            </p>
                          </div>
                        </div>

                        {canManageMembers && member.role === "FREELANCER" && (
                          <button
                            onClick={() => removeMember(member.userId)}
                            disabled={isRemovingMember}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Receipt size={14} />
                  Invoices
                </h3>
                <Link href={`/invoices?projectId=${projectId}`} className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300">
                  View All
                </Link>
              </div>

              <div className="p-4 space-y-3">
                {isInvoicesLoading ? (
                  <p className="text-xs text-slate-500">Loading invoices...</p>
                ) : invoices.length === 0 ? (
                  <p className="text-xs text-slate-500">No invoices yet.</p>
                ) : (
                  invoices.slice(0, 4).map((invoice) => (
                    <div key={invoice.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-mono text-slate-300">#{invoice.id}</span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{invoice.status}</span>
                      </div>
                      <p className="mt-1 text-sm font-bold text-white">
                        {Number(invoice.amount).toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </aside>
        )}
      />

      <CreateTaskModal
        isOpen={isCreateTaskModalOpen}
        onClose={() => setIsCreateTaskModalOpen(false)}
        defaultStatus={defaultStatus}
      />

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
    </div>
  );
}
