"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, User, ChevronDown, LayoutGrid, List, Flag, Check, TimerReset, SlidersHorizontal, X, Sparkles } from "lucide-react";
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
import { SmartUploadSlideover } from "@/features/smart-tasks/components/smart-upload-slideover";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  parseTasksQuery,
  type TaskDueFilterValue,
  type TaskPriorityFilterValue,
  type TaskStatusFilterValue,
  type TasksViewMode,
} from "@/features/tasks/query/tasks-query.schema";

const TASKS_VIEW_STORAGE_KEY = "clienthub.tasks.view-mode";

const TASK_STATUS_FILTER_OPTIONS: Array<{ value: TaskStatusFilterValue; label: string }> = [
  { value: "ALL", label: "All Statuses" },
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELED, label: "Cancelled" },
];

const TASK_DUE_FILTER_OPTIONS: Array<{ value: TaskDueFilterValue; label: string }> = [
  { value: "ALL", label: "All Due Dates" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TODAY", label: "Due Today" },
  { value: "THIS_WEEK", label: "Due This Week" },
  { value: "NO_DUE_DATE", label: "No Due Date" },
];

type AdvancedFilters = {
  keyword: string;
  statuses: TaskStatus[];
  minEstimate: string;
  maxEstimate: string;
};

const DEFAULT_ADVANCED_FILTERS: AdvancedFilters = {
  keyword: "",
  statuses: [],
  minEstimate: "",
  maxEstimate: "",
};

function isTaskMatchingDueFilter(task: Task, dueFilter: TaskDueFilterValue): boolean {
  if (dueFilter === "ALL") {
    return true;
  }

  if (!task.dueDate) {
    return dueFilter === "NO_DUE_DATE";
  }

  const dueDate = new Date(task.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return false;
  }

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const endOfThisWeek = new Date(startOfToday);
  endOfThisWeek.setDate(endOfThisWeek.getDate() + 7);

  if (dueFilter === "OVERDUE") {
    return dueDate < startOfToday && task.status !== TaskStatus.DONE && task.status !== TaskStatus.CANCELED;
  }

  if (dueFilter === "TODAY") {
    return dueDate >= startOfToday && dueDate < startOfTomorrow;
  }

  if (dueFilter === "THIS_WEEK") {
    return dueDate >= startOfToday && dueDate < endOfThisWeek;
  }

  return false;
}

function isTaskMatchingAdvancedFilters(task: Task, filters: AdvancedFilters): boolean {
  const keyword = filters.keyword.trim().toLowerCase();
  if (keyword) {
    const searchable = [
      task.title,
      task.description ?? "",
      task.projectTitle,
      task.assignedTo?.fullName ?? "",
      task.assignedTo?.email ?? "",
    ]
      .join(" ")
      .toLowerCase();

    if (!searchable.includes(keyword)) {
      return false;
    }
  }

  if (filters.statuses.length > 0 && !filters.statuses.includes(task.status)) {
    return false;
  }

  const minEstimate = filters.minEstimate.trim() === "" ? undefined : Number(filters.minEstimate);
  const maxEstimate = filters.maxEstimate.trim() === "" ? undefined : Number(filters.maxEstimate);

  if ((minEstimate !== undefined && Number.isNaN(minEstimate)) || (maxEstimate !== undefined && Number.isNaN(maxEstimate))) {
    return false;
  }

  if (minEstimate !== undefined || maxEstimate !== undefined) {
    if (typeof task.estimatedHours !== "number") {
      return false;
    }
    if (minEstimate !== undefined && task.estimatedHours < minEstimate) {
      return false;
    }
    if (maxEstimate !== undefined && task.estimatedHours > maxEstimate) {
      return false;
    }
  }

  return true;
}

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
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    initialQueryState.projectId,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isNewTaskDropdownOpen, setIsNewTaskDropdownOpen] = React.useState(false);
  const [isSmartUploadOpen, setIsSmartUploadOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus>(TaskStatus.TODO);
  const [viewMode, setViewMode] = React.useState<TasksViewMode>(initialQueryState.viewMode);
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilterValue>(
    initialQueryState.priorityFilter,
  );
  const [statusFilter, setStatusFilter] = React.useState<TaskStatusFilterValue>(
    initialQueryState.statusFilter,
  );
  const [dueFilter, setDueFilter] = React.useState<TaskDueFilterValue>(
    initialQueryState.dueFilter,
  );
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string | undefined>(
    initialQueryState.assigneeId,
  );
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] = React.useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = React.useState(false);
  const [dueDropdownOpen, setDueDropdownOpen] = React.useState(false);
  const [assigneeDropdownOpen, setAssigneeDropdownOpen] = React.useState(false);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>({
    keyword: initialQueryState.keyword,
    statuses: initialQueryState.advancedStatuses,
    minEstimate: initialQueryState.estimateMin,
    maxEstimate: initialQueryState.estimateMax,
  });
  const [draftAdvancedFilters, setDraftAdvancedFilters] = React.useState<AdvancedFilters>({
    keyword: initialQueryState.keyword,
    statuses: initialQueryState.advancedStatuses,
    minEstimate: initialQueryState.estimateMin,
    maxEstimate: initialQueryState.estimateMax,
  });
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const priorityDropdownRef = React.useRef<HTMLDivElement>(null);
  const statusDropdownRef = React.useRef<HTMLDivElement>(null);
  const dueDropdownRef = React.useRef<HTMLDivElement>(null);
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
    const serializedAdvancedStatuses = advancedFilters.statuses.join(",");

    const next = buildUpdatedQueryString(queryString, [
      { key: "projectId", value: selectedProjectId },
      { key: "view", value: viewMode, defaultValue: "kanban" },
      { key: "priority", value: priorityFilter, defaultValue: "ALL" },
      { key: "status", value: statusFilter, defaultValue: "ALL" },
      { key: "due", value: dueFilter, defaultValue: "ALL" },
      { key: "assignee", value: selectedAssigneeId },
      { key: "keyword", value: advancedFilters.keyword },
      { key: "statuses", value: serializedAdvancedStatuses },
      { key: "estimateMin", value: advancedFilters.minEstimate },
      { key: "estimateMax", value: advancedFilters.maxEstimate },
    ]);

    if (queryString !== next) {
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    }
  }, [
    advancedFilters.keyword,
    advancedFilters.maxEstimate,
    advancedFilters.minEstimate,
    advancedFilters.statuses,
    dueFilter,
    pathname,
    priorityFilter,
    queryString,
    router,
    selectedAssigneeId,
    selectedProjectId,
    statusFilter,
    viewMode,
  ]);

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
      status: statusFilter === "ALL" ? undefined : statusFilter,
      page: 0,
      size: 50,
    }),
    [priorityFilter, selectedAssigneeId, selectedProjectId, statusFilter]
  );

  const { data, isLoading, isError } = useTasksQuery(params);
  const tasks = React.useMemo(() => data?.content ?? [], [data?.content]);

  const filteredTasks = React.useMemo(
    () => tasks
      .filter((task) => isTaskMatchingDueFilter(task, dueFilter))
      .filter((task) => isTaskMatchingAdvancedFilters(task, advancedFilters)),
    [advancedFilters, dueFilter, tasks],
  );

  const hasActiveAdvancedFilters = React.useMemo(() => {
    return (
      advancedFilters.keyword.trim() !== "" ||
      advancedFilters.statuses.length > 0 ||
      advancedFilters.minEstimate.trim() !== "" ||
      advancedFilters.maxEstimate.trim() !== ""
    );
  }, [advancedFilters]);

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

  const statusLabel = React.useMemo(() => {
    if (statusFilter === "ALL") return "Status";
    const option = TASK_STATUS_FILTER_OPTIONS.find((item) => item.value === statusFilter);
    return option?.label || "Status";
  }, [statusFilter]);

  const dueLabel = React.useMemo(() => {
    if (dueFilter === "ALL") return "Due";
    const option = TASK_DUE_FILTER_OPTIONS.find((item) => item.value === dueFilter);
    return option?.label || "Due";
  }, [dueFilter]);

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
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target as Node)) {
        setStatusDropdownOpen(false);
      }
      if (dueDropdownRef.current && !dueDropdownRef.current.contains(e.target as Node)) {
        setDueDropdownOpen(false);
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

  React.useEffect(() => {
    if (isAdvancedFiltersOpen) {
      setDraftAdvancedFilters(advancedFilters);
    }
  }, [advancedFilters, isAdvancedFiltersOpen]);

  if (!isMounted) return null;

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  const handleToggleDraftStatus = (status: TaskStatus) => {
    setDraftAdvancedFilters((prev) => {
      const exists = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: exists ? prev.statuses.filter((item) => item !== status) : [...prev.statuses, status],
      };
    });
  };

  const handleApplyAdvancedFilters = () => {
    setAdvancedFilters(draftAdvancedFilters);
    setIsAdvancedFiltersOpen(false);
  };

  const handleResetAdvancedFilters = () => {
    setDraftAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
    setAdvancedFilters(DEFAULT_ADVANCED_FILTERS);
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

            <div className="relative" ref={statusDropdownRef}>
              <button
                onClick={() => setStatusDropdownOpen((current) => !current)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors"
              >
                <Check size={12} className="text-slate-500" />
                {statusLabel}
                <ChevronDown size={11} className={cn("text-slate-500 transition-transform", statusDropdownOpen && "rotate-180")} />
              </button>

              {statusDropdownOpen ? (
                <div className="absolute right-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  {TASK_STATUS_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setStatusFilter(option.value);
                        setStatusDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                        statusFilter === option.value ? "text-emerald-400" : "text-slate-300",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="relative" ref={dueDropdownRef}>
              <button
                onClick={() => setDueDropdownOpen((current) => !current)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors"
              >
                <TimerReset size={12} className="text-slate-500" />
                {dueLabel}
                <ChevronDown size={11} className={cn("text-slate-500 transition-transform", dueDropdownOpen && "rotate-180")} />
              </button>

              {dueDropdownOpen ? (
                <div className="absolute right-0 mt-2 w-52 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                  {TASK_DUE_FILTER_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setDueFilter(option.value);
                        setDueDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                        dueFilter === option.value ? "text-emerald-400" : "text-slate-300",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs transition-colors",
                hasActiveAdvancedFilters
                  ? "bg-emerald-500/12 border-emerald-500/30 text-emerald-300"
                  : "bg-white/4 border-white/8 text-slate-400 hover:border-white/20 hover:text-slate-200",
              )}
            >
              <SlidersHorizontal size={12} className={hasActiveAdvancedFilters ? "text-emerald-300" : "text-slate-500"} />
              Advanced
              {hasActiveAdvancedFilters ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-400/20 px-1 text-[10px] font-semibold text-emerald-300">
                  ON
                </span>
              ) : null}
            </button>

            <div className="relative ml-1">
              <button
                onClick={() => setIsNewTaskDropdownOpen(!isNewTaskDropdownOpen)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-900/20"
              >
                <Plus size={15} />
                New <ChevronDown size={14} className="ml-0.5 opacity-70" />
              </button>

              {isNewTaskDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsNewTaskDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-700/50 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setIsNewTaskDropdownOpen(false);
                        handleAddTask(TaskStatus.TODO);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Plus size={16} className="text-emerald-400" />
                      Manual Task
                    </button>
                    <button
                      onClick={() => {
                        setIsNewTaskDropdownOpen(false);
                        if (!selectedProjectId) {
                          toast.error("Please select a project first to use Smart Upload");
                          return;
                        }
                        setIsSmartUploadOpen(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                    >
                      <Sparkles size={16} className="text-emerald-400" />
                      Smart Upload (AI)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/*
          TODO(tasks-filters-v2): Persist custom filter presets (Saved Views) per user.
          TODO(tasks-filters-v2): Move due-date and keyword filters to backend query params when API supports predicates.
        */}
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

      {isAdvancedFiltersOpen ? (
        <>
          <button
            aria-label="Close advanced filters"
            onClick={() => setIsAdvancedFiltersOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
          />
          <aside className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l border-white/10 bg-[#0c0c0c] shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">Advanced Filters</h3>
                  <p className="mt-1 text-xs text-slate-400">Refine tasks by keyword, statuses, and estimate range.</p>
                </div>
                <button
                  onClick={() => setIsAdvancedFiltersOpen(false)}
                  className="rounded-md border border-white/10 p-1.5 text-slate-400 transition-colors hover:border-white/20 hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Keyword</label>
                  <input
                    value={draftAdvancedFilters.keyword}
                    onChange={(event) =>
                      setDraftAdvancedFilters((prev) => ({
                        ...prev,
                        keyword: event.target.value,
                      }))
                    }
                    placeholder="Title, description, project, assignee..."
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Statuses</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "To Do", value: TaskStatus.TODO },
                      { label: "In Progress", value: TaskStatus.IN_PROGRESS },
                      { label: "Done", value: TaskStatus.DONE },
                      { label: "Cancelled", value: TaskStatus.CANCELED },
                    ].map((option) => {
                      const selected = draftAdvancedFilters.statuses.includes(option.value);
                      return (
                        <button
                          key={option.value}
                          onClick={() => handleToggleDraftStatus(option.value)}
                          className={cn(
                            "rounded-lg border px-3 py-2 text-left text-xs font-medium transition-colors",
                            selected
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                              : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20",
                          )}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">Estimated Hours</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={draftAdvancedFilters.minEstimate}
                      onChange={(event) =>
                        setDraftAdvancedFilters((prev) => ({
                          ...prev,
                          minEstimate: event.target.value,
                        }))
                      }
                      placeholder="Min"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none"
                    />
                    <input
                      type="number"
                      min={0}
                      step={0.5}
                      value={draftAdvancedFilters.maxEstimate}
                      onChange={(event) =>
                        setDraftAdvancedFilters((prev) => ({
                          ...prev,
                          maxEstimate: event.target.value,
                        }))
                      }
                      placeholder="Max"
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-400/40 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-white/10 px-5 py-4">
                <button
                  onClick={handleResetAdvancedFilters}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-white/20"
                >
                  Reset
                </button>
                <button
                  onClick={handleApplyAdvancedFilters}
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-emerald-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </aside>
        </>
      ) : null}

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

      <SmartUploadSlideover
        isOpen={isSmartUploadOpen}
        projectId={selectedProjectId || ""}
        onClose={() => setIsSmartUploadOpen(false)}
        onTasksCreated={() => {
          if (selectedProjectId) {
            queryClient.invalidateQueries({ queryKey: ["tasks", { projectId: selectedProjectId }] });
          } else {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
          }
        }}
      />
    </div>
  );
}