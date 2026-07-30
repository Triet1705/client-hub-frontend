"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Plus, User, ChevronDown, LayoutGrid, List, Flag, Check, TimerReset, SlidersHorizontal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildUpdatedQueryString } from "@/lib/url-query";
import { TaskStatus, type Task } from "@/features/tasks/types/task.types";
import { TASK_PRIORITY_OPTIONS } from "@/features/tasks/constants/task-ui.constants";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useTaskQuery, useTasksQuery } from "@/features/tasks/hooks/use-tasks";
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
import {
  AdvancedFilters,
  DEFAULT_ADVANCED_FILTERS,
  isTaskMatchingDueFilter,
  isTaskMatchingAdvancedFilters,
} from "@/features/tasks/utils/task-filter";
import { TaskAdvancedFilters } from "@/features/tasks/components/task-advanced-filters";
import { FilterDropdown, type FilterDropdownOption } from "@/components/ui/filter-dropdown";
import { PROJECT_STATUS_BADGE, PROJECT_STATUS_LABEL } from "@/features/projects/constants/project-ui.constants";
import { TasksSkeleton } from "@/components/skeletons/page-skeletons";


const TASKS_VIEW_STORAGE_KEY = "clienthub.tasks.view-mode";

const TASK_STATUS_FILTER_OPTIONS: FilterDropdownOption<TaskStatusFilterValue>[] = [
  { value: "ALL", label: "All Statuses" },
  { value: TaskStatus.TODO, label: "To Do" },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress" },
  { value: TaskStatus.DONE, label: "Done" },
  { value: TaskStatus.CANCELED, label: "Cancelled" },
];

const TASK_DUE_FILTER_OPTIONS: FilterDropdownOption<TaskDueFilterValue>[] = [
  { value: "ALL", label: "All Due Dates" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "TODAY", label: "Due Today" },
  { value: "THIS_WEEK", label: "Due This Week" },
  { value: "NO_DUE_DATE", label: "No Due Date" },
];



export default function TasksPage() {
  return (
    <React.Suspense fallback={<TasksSkeleton />}>
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
  const targetTaskId = searchParams.get("taskId");
  const { user } = useAuthStore();
  const canManageTask = user?.role === "CLIENT" || user?.role === "ADMIN";
  const queryClient = useQueryClient();

  const [selectedProjectId, setSelectedProjectId] = React.useState<string | undefined>(
    initialQueryState.projectId,
  );
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = React.useState(false);
  const [isNewTaskDropdownOpen, setIsNewTaskDropdownOpen] = React.useState(false);
  const [isSmartUploadOpen, setIsSmartUploadOpen] = React.useState(false);
  const [defaultStatus, setDefaultStatus] = React.useState<TaskStatus>(TaskStatus.TODO);
  const [viewMode, setViewMode] = React.useState<TasksViewMode>(initialQueryState.viewMode);
  const [priorityFilter, setPriorityFilter] = React.useState<TaskPriorityFilterValue>(initialQueryState.priorityFilter);
  const [statusFilter, setStatusFilter] = React.useState<TaskStatusFilterValue>(initialQueryState.statusFilter);
  const [dueFilter, setDueFilter] = React.useState<TaskDueFilterValue>(initialQueryState.dueFilter);
  const [selectedAssigneeId, setSelectedAssigneeId] = React.useState<string | undefined>(initialQueryState.assigneeId);
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = React.useState(false);
  const [advancedFilters, setAdvancedFilters] = React.useState<AdvancedFilters>({
    keyword: initialQueryState.keyword,
    statuses: initialQueryState.advancedStatuses,
    minEstimate: initialQueryState.estimateMin,
    maxEstimate: initialQueryState.estimateMax,
  });
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const { data: projectsData, isLoading: isProjectsLoading } = useProjectsQuery(0, 50);
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
  const { data: targetTask } = useTaskQuery(targetTaskId);
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

  const assigneeOptions = React.useMemo(() => [
    { value: "ALL", label: "All Assignees" },
    ...projectMembers.map(m => ({ value: m.userId, label: m.fullName || m.email }))
  ], [projectMembers]);

  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => { setIsMounted(true); }, []);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProjectDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  React.useEffect(() => {
    if (!targetTaskId) {
      setSelectedTask(null);
    }
  }, [selectedProjectId, targetTaskId]);

  React.useEffect(() => {
    if (!targetTask) return;
    setSelectedProjectId(targetTask.projectId);
    setSelectedTask(targetTask);
  }, [targetTask]);

  if (!isMounted || (isProjectsLoading && projects.length === 0) || (isLoading && !data)) {
    return <TasksSkeleton />;
  }

  const handleSelectTask = (task: Task) => {
    setSelectedTask(task);
    const next = buildUpdatedQueryString(queryString, [
      { key: "taskId", value: task.id },
    ]);
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleCloseTask = () => {
    setSelectedTask(null);
    const next = buildUpdatedQueryString(queryString, [
      { key: "taskId", value: undefined },
    ]);
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  };

  const handleAddTask = (status: TaskStatus) => {
    setDefaultStatus(status);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="-m-4 flex h-[calc(100vh-64px)] flex-col sm:-m-6 lg:-m-8">
      <div className="px-6 pt-5 pb-3 border-b border-theme-border flex flex-col gap-3 shrink-0">

        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setProjectDropdownOpen(o => !o)}
              className="flex items-center gap-2 group"
            >
              <h2 className="text-lg font-bold text-content-primary tracking-tight">
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
                "text-content-muted transition-transform duration-150",
                projectDropdownOpen && "rotate-180"
              )} />
            </button>

            {projectDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-surface border border-theme-border rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-theme-border">
                  <span className="text-[10px] text-content-muted uppercase tracking-wider font-semibold">Switch Project</span>
                </div>
                <div className="max-h-56 overflow-y-auto no-scrollbar py-1">
                  {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedProjectId(p.id); setProjectDropdownOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-sunken transition-colors gap-2",
                        p.id === selectedProjectId && "bg-action-subtle"
                      )}
                    >
                      <span className={cn(
                        "text-sm font-medium truncate",
                        p.id === selectedProjectId ? "text-theme-accent" : "text-content-secondary"
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
                        {p.id === selectedProjectId && <Check size={12} className="text-theme-accent" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isLoading && filteredTasks.length >= 0 && (
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <span>To Do: <span className="text-content-secondary font-medium">{todoCount}</span></span>
              <span className="text-content-muted">·</span>
              <span>In Progress: <span className="text-content-secondary font-medium">{inProgressCount}</span></span>
              <span className="text-content-muted">·</span>
              <span>Done: <span className="text-content-secondary font-medium">{doneCount}</span></span>
              <span className="text-content-muted">·</span>
              <span>Total: <span className="text-content-secondary font-medium">{filteredTasks.length}</span></span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0.5 rounded-lg border border-theme-border bg-surface p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "kanban" ? "bg-surface-sunken text-content-primary" : "text-content-muted hover:text-content-secondary"
              )}
            >
              <LayoutGrid size={13} />
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                viewMode === "list" ? "bg-surface-sunken text-content-primary" : "text-content-muted hover:text-content-secondary"
              )}
            >
              <List size={13} />
              List
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <FilterDropdown
              icon={Flag}
              label="Priority"
              options={[{ value: "ALL" as const, label: "All Priorities" }, ...TASK_PRIORITY_OPTIONS]}
              value={priorityFilter}
              onChange={(val) => setPriorityFilter(val)}
            />

            <FilterDropdown
              icon={User}
              label="Assignee"
              options={assigneeOptions}
              value={selectedAssigneeId ?? "ALL"}
              onChange={(val) => setSelectedAssigneeId(val === "ALL" ? undefined : val)}
            />

            <FilterDropdown
              icon={Check}
              label="Status"
              options={TASK_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(val) => setStatusFilter(val)}
            />

            <FilterDropdown
              icon={TimerReset}
              label="Due"
              options={TASK_DUE_FILTER_OPTIONS}
              value={dueFilter}
              onChange={(val) => setDueFilter(val)}
            />

            <button
              onClick={() => setIsAdvancedFiltersOpen(true)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 border rounded-full text-xs transition-colors",
                hasActiveAdvancedFilters
                  ? "bg-action-subtle border-theme-accent text-theme-accent"
                  : "border-theme-border bg-surface text-content-secondary hover:border-content-muted hover:text-content-primary",
              )}
            >
              <SlidersHorizontal size={12} className={hasActiveAdvancedFilters ? "text-theme-accent" : "text-content-muted"} />
              Advanced
              {hasActiveAdvancedFilters ? (
                <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-action-subtle px-1 text-[10px] font-semibold text-theme-accent">
                  ON
                </span>
              ) : null}
            </button>

            <div className="relative ml-1">
              <button
                onClick={() => setIsNewTaskDropdownOpen(!isNewTaskDropdownOpen)}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-action-primary text-action-primary-foreground rounded-lg hover:bg-action-primary-hover transition-colors shadow-lg shadow-theme"
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
                  <div className="absolute right-0 mt-2 w-48 bg-surface border border-theme-border/50 rounded-xl shadow-xl z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setIsNewTaskDropdownOpen(false);
                        handleAddTask(TaskStatus.TODO);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-content-secondary hover:bg-surface-elevated hover:text-content-primary flex items-center gap-2"
                    >
                      <Plus size={16} className="text-theme-accent" />
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
                      className="w-full text-left px-4 py-2.5 text-sm text-content-secondary hover:bg-surface-elevated hover:text-content-primary flex items-center gap-2"
                    >
                      <Sparkles size={16} className="text-theme-accent" />
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
        <div className="m-6 p-6 bg-status-danger-surface border border-status-danger-border rounded-2xl text-status-danger-text max-w-5xl mx-auto w-full">
          Failed to load tasks. Please ensure backend is running.
        </div>
      ) : isLoading ? (
        <div className="flex-1 flex h-full gap-5 p-6 max-w-5xl mx-auto w-full">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-80 flex flex-col gap-3">
              <div className="h-8 bg-surface-elevated/50 rounded-md animate-pulse"></div>
              <div className="h-24 bg-surface-elevated/30 rounded-md animate-pulse"></div>
              <div className="h-24 bg-surface-elevated/30 rounded-md animate-pulse"></div>
            </div>
          ))}
        </div>
      ) : viewMode === "list" ? (
        <div className="px-6 flex-1 w-full max-w-7xl mx-auto overflow-y-auto">
          <TaskList tasks={filteredTasks} onTaskClick={handleSelectTask} />
        </div>
      ) : (
        <TaskBoard
          tasks={filteredTasks}
          currentParams={params}
          onAddTask={handleAddTask}
          onTaskClick={handleSelectTask}
        />
      )}

      <TaskAdvancedFilters
        isOpen={isAdvancedFiltersOpen}
        onClose={() => setIsAdvancedFiltersOpen(false)}
        filters={advancedFilters}
        onApply={setAdvancedFilters}
        onReset={() => setAdvancedFilters(DEFAULT_ADVANCED_FILTERS)}
      />

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
        onClose={handleCloseTask}
      />

      <SmartUploadSlideover
        isOpen={isSmartUploadOpen}
        projectId={selectedProjectId || ""}
        onClose={() => setIsSmartUploadOpen(false)}
        onTasksCreated={() => {
          queryClient.invalidateQueries({ queryKey: ["tasks", "list"] });
        }}
      />
    </div>
  );
}
