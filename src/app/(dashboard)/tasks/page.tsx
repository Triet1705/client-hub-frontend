"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, User, ChevronDown, LayoutGrid, List, Flag, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { TaskPriority, TaskStatus, type Task } from "@/features/tasks/types/task.types";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { ProjectStatus } from "@/features/projects/types/project.types";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTasksQuery } from "@/features/tasks/hooks/use-tasks";
import { useProjectsQuery, useProjectMembersQuery } from "@/features/projects/hooks/use-projects";
import { TaskBoard } from "@/features/tasks/components/task-board";
import { TaskList } from "@/features/tasks/components/task-list";
import { CreateTaskModal } from "@/features/tasks/components/create-task-modal";
import { TaskDetailSlideover } from "@/features/projects/components/task-detail-slideover";
import {
  parseTasksQuery,
  type TaskPriorityFilterValue,
  type TasksViewMode,
} from "@/features/tasks/query/tasks-query.schema";

const TASKS_VIEW_STORAGE_KEY = "clienthub.tasks.view-mode";

const PROJECT_STATUS_BADGE: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "text-slate-300 bg-slate-700/50 border-slate-600/40",
  [ProjectStatus.IN_PROGRESS]:"text-emerald-400 bg-emerald-400/10 border-emerald-400/30",
  [ProjectStatus.ON_HOLD]:    "text-amber-400 bg-amber-400/10 border-amber-400/20",
  [ProjectStatus.COMPLETED]:  "text-blue-400 bg-blue-400/10 border-blue-400/20",
  [ProjectStatus.CANCELLED]:  "text-rose-400 bg-rose-400/10 border-rose-400/20",
};

const PROJECT_STATUS_LABEL: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]:   "Planning",
  [ProjectStatus.IN_PROGRESS]:"Active",
  [ProjectStatus.ON_HOLD]:    "On Hold",
  [ProjectStatus.COMPLETED]:  "Completed",
  [ProjectStatus.CANCELLED]:  "Cancelled",
};

export default function TasksPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-slate-400">Loading tasks...</div>}>
      <TasksPageContent />
    </React.Suspense>
  );
}

function TasksPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialQueryState = parseTasksQuery(searchParams);
  const queryString = searchParams.toString();
  const { user } = useAuthStore();
  const canManageTask = user?.role === "CLIENT" || user?.role === "ADMIN";

  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    initialQueryState.projectId,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus>(TaskStatus.TODO);
  const [viewMode, setViewMode] = React.useState<TasksViewMode>(initialQueryState.viewMode);
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilterValue>(
    initialQueryState.priorityFilter,
  );
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string | undefined>(
    initialQueryState.assigneeId,
  );
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = React.useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const priorityDropdownRef = React.useRef<HTMLDivElement>(null);
  const assigneeDropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: projectsData } = useProjectsQuery(0, 50);
  const projects = React.useMemo(() => projectsData?.content ?? [], [projectsData]);

  // Auto-select first project once loaded
  React.useEffect(() => {
    if (!selectedProjectId && projects.length > 0) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  React.useEffect(() => {
    if (searchParams.get("view")) return;
    if (typeof window === "undefined") return;

    const stored = window.localStorage.getItem(TASKS_VIEW_STORAGE_KEY);
    if (stored === "kanban" || stored === "list") {
      setViewMode(stored);
    }
  }, [searchParams]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TASKS_VIEW_STORAGE_KEY, viewMode);
  }, [viewMode]);

  React.useEffect(() => {
    const next = buildUpdatedQueryString(queryString, [
      { key: "projectId", value: selectedProjectId },
      { key: "view", value: viewMode, defaultValue: "kanban" },
      { key: "priority", value: priorityFilter, defaultValue: "ALL" },
      { key: "assignee", value: selectedAssigneeId },
    ]);

    if (queryString !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [pathname, priorityFilter, queryString, router, selectedAssigneeId, selectedProjectId, viewMode]);

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const { data: projectMembers = [] } = useProjectMembersQuery(selectedProjectId ?? "");

  React.useEffect(() => {
    if (!selectedAssigneeId) return;
    const stillExists = projectMembers.some((member) => member.userId === selectedAssigneeId);
    if (!stillExists) {
      setSelectedAssigneeId(undefined);
    }
  }, [projectMembers, selectedAssigneeId]);

  const params = React.useMemo(
    () => ({
      projectId: selectedProjectId,
      assignedToId: selectedAssigneeId,
      priority: priorityFilter === "ALL" ? undefined : priorityFilter,
      page: 0,
      size: 50,
    }),
    [priorityFilter, selectedAssigneeId, selectedProjectId]
  );

  const { data, isLoading, isError } = useTasksQuery(params);
  const tasks = React.useMemo(() => data?.content ?? [], [data?.content]);

  const filteredTasks = tasks;

  const todoCount       = filteredTasks.filter((t) => t.status === TaskStatus.TODO).length;
  const inProgressCount = filteredTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
  const doneCount       = filteredTasks.filter((t) => t.status === TaskStatus.DONE).length;

  const assigneeLabel = React.useMemo(() => {
    if (!selectedAssigneeId) return "Assignee";
    const member = projectMembers.find((item) => item.userId === selectedAssigneeId);
    return member?.fullName || member?.email || "Assignee";
  }, [projectMembers, selectedAssigneeId]);

  const priorityLabel = React.useMemo(() => {
    if (priorityFilter === "ALL") return "Priority";
    const option = TASK_PRIORITY_OPTIONS.find((item) => item.value === priorityFilter as TaskPriority);
    return option?.label || "Priority";
  }, [priorityFilter]);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
      if (priorityDropdownRef.current && !priorityDropdownRef.current.contains(e.target as Node)) {
        setPriorityDropdownOpen(false);
      }
      if (assigneeDropdownRef.current && !assigneeDropdownRef.current.contains(e.target as Node)) {
        setAssigneeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    setSelectedTask(null);
  }, [selectedProjectId]);

  if (!isMounted) return null;

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] -m-8">
      <div className="px-6 pt-5 pb-3 border-b border-white/5 flex flex-col gap-3 shrink-0">

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProjectDropdownOpen(o => !o)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-lg font-bold text-white tracking-tight">
                {selectedProject?.title ?? "Select a project"}
              </h2>
              {selectedProject && (
                <span className={cn(
                  "px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide",
                  PROJECT_STATUS_BADGE[selectedProject.status]
                )}>
                  {PROJECT_STATUS_LABEL[selectedProject.status]}
                </span>
              )}
              <ChevronDown size={14} className={cn(
                "text-slate-500 transition-transform duration-150",
                projectDropdownOpen && "rotate-180"
              )} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-white/5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Switch Project</span>
                </div>
                <div className="max-h-56 overflow-y-auto no-scrollbar py-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProjectId(p.id); setProjectDropdownOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-white/5 transition-colors gap-2",
                        p.id === selectedProjectId && "bg-emerald-500/8"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium truncate",
                        p.id === selectedProjectId ? "text-emerald-400" : "text-slate-300"
                      )}>
                        {p.title}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          "px-1.5 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wide",
                          PROJECT_STATUS_BADGE[p.status]
                        )}>
                          {PROJECT_STATUS_LABEL[p.status]}
                        </span>
                        {p.id === selectedProjectId && <Check size={12} className="text-emerald-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isLoading && filteredTasks.length >= 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>To Do: <span className="text-slate-300 font-medium">{todoCount}</span></span>
              <span className="text-slate-700">·</span>
              <span>In Progress: <span className="text-slate-300 font-medium">{inProgressCount}</span></span>
              <span className="text-slate-700">·</span>
              <span>Done: <span className="text-slate-300 font-medium">{doneCount}</span></span>
              <span className="text-slate-700">·</span>
              <span>Total: <span className="text-slate-300 font-medium">{filteredTasks.length}</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 bg-white/4 border border-white/8 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "kanban" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutGrid size={13} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "list" ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <List size={13} />
              List
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative" ref={priorityDropdownRef}>
              <button
                onClick={() => setPriorityDropdownOpen((current) => !current)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors"
              >
                <Flag size={12} className="text-slate-500" />
                {priorityLabel}
                <ChevronDown size={11} className={cn("text-slate-500 transition-transform", priorityDropdownOpen && "rotate-180")} />
              </button>

              {priorityDropdownOpen ? (
                <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  <button
                    onClick={() => {
                      setPriorityFilter("ALL");
                      setPriorityDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                      priorityFilter === "ALL" ? "text-emerald-400" : "text-slate-300",
                    )}
                  >
                    All Priorities
                  </button>
                  {TASK_PRIORITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPriorityFilter(option.value);
                        setPriorityDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                        priorityFilter === option.value ? "text-emerald-400" : "text-slate-300",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative" ref={assigneeDropdownRef}>
              <button
                onClick={() => setAssigneeDropdownOpen((current) => !current)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors"
              >
                <User size={13} className="text-slate-500" />
                <span className="max-w-28 truncate">{assigneeLabel}</span>
                <ChevronDown size={11} className={cn("text-slate-500 transition-transform", assigneeDropdownOpen && "rotate-180")} />
              </button>

              {assigneeDropdownOpen ? (
                <div className="absolute right-0 mt-2 w-56 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-72 overflow-y-auto no-scrollbar">
                  <button
                    onClick={() => {
                      setSelectedAssigneeId(undefined);
                      setAssigneeDropdownOpen(false);
                    }}
                    className={cn(
                      "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                      !selectedAssigneeId ? "text-emerald-400" : "text-slate-300",
                    )}
                  >
                    All Assignees
                  </button>
                  {projectMembers.map((member) => (
                    <button
                      key={member.userId}
                      onClick={() => {
                        setSelectedAssigneeId(member.userId);
                        setAssigneeDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                        selectedAssigneeId === member.userId ? "text-emerald-400" : "text-slate-300",
                      )}
                    >
                      {member.fullName || member.email}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              onClick={() => handleAddTask(TaskStatus.TODO)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors ml-1"
            >
              <Plus size={15} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {isError ? (
        <div className="m-6 p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 max-w-5xl mx-auto w-full">
          Failed to load tasks. Please ensure backend is running.
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex h-full gap-5 p-6 max-w-5xl mx-auto w-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-80 flex flex-col gap-3">
              <div className="h-8 bg-slate-800/50 rounded-md animate-pulse"></div>
              <div className="h-24 bg-slate-800/30 rounded-md animate-pulse"></div>
              <div className="h-24 bg-slate-800/30 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="px-6 flex-1 w-full max-w-7xl mx-auto overflow-y-auto">
          <TaskList tasks={filteredTasks} onTaskClick={setSelectedTask} />
        </div>
      ) : (
        <TaskBoard
          tasks={filteredTasks}
          currentParams={params}
          onAddTask={handleAddTask}
          onTaskClick={setSelectedTask}
        />
      )}

      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus={defaultStatus}
      />

      <TaskDetailSlideover
        task={selectedTask}
        isClient={canManageTask}
        projectMembers={projectMembers}
        projectParams={params}
        currentUserId={user?.id}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  );
}