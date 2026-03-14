"use client";

import * as React from "react";
import { X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Task, TaskStatus, TaskPriority, type TaskRequestPayload, type FetchTasksParams } from "@/features/tasks/types/task.types";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import {
  useUpdateTaskMutation,
  useUpdateTaskStatusMutation,
  useDeleteTaskMutation,
} from "@/features/tasks/hooks/use-tasks";
import type { ProjectMember } from "../types/project.types";

interface TaskDetailSlideoverProps {
  task: Task | null;
  isClient: boolean;
  projectMembers: ProjectMember[];
  projectParams: FetchTasksParams;
  currentUserId?: string;
  onClose: () => void;
}

const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { value: TaskPriority.LOW,    label: "Low",    color: "text-slate-400" },
  { value: TaskPriority.MEDIUM, label: "Medium", color: "text-blue-400"  },
  { value: TaskPriority.HIGH,   label: "High",   color: "text-amber-400" },
  { value: TaskPriority.URGENT, label: "Urgent", color: "text-red-400"   },
];

const STATUS_LABELS: Record<TaskStatus, string> = {
  [TaskStatus.TODO]:        "To Do",
  [TaskStatus.IN_PROGRESS]: "In Progress",
  [TaskStatus.DONE]:        "Done",
  [TaskStatus.CANCELLED]:   "Cancelled",
};

export function TaskDetailSlideover({
  task,
  isClient,
  projectMembers,
  projectParams,
  currentUserId: _currentUserId,
  onClose,
}: TaskDetailSlideoverProps) {
  const isOpen = task !== null;

  const { mutate: updateTask, isPending: isSaving } = useUpdateTaskMutation(projectParams);
  const { mutate: updateStatus } = useUpdateTaskStatusMutation(projectParams);
  const { mutate: deleteTask }   = useDeleteTaskMutation();

  const [assignedToId,    setAssignedToId]    = React.useState("");
  const [priority,        setPriority]        = React.useState<TaskPriority>(TaskPriority.MEDIUM);
  const [estimatedHours,  setEstimatedHours]  = React.useState("");
  const [actualHours,     setActualHours]     = React.useState("");
  const [dueDate,         setDueDate]         = React.useState("");
  const [description,     setDescription]     = React.useState("");
  const [activeStatus,    setActiveStatus]    = React.useState<TaskStatus>(TaskStatus.TODO);

  // Sync state when selected task changes
  React.useEffect(() => {
    if (!task) return;
    setAssignedToId(task.assignedTo?.id ?? "");
    setPriority(task.priority);
    setEstimatedHours(task.estimatedHours != null ? String(task.estimatedHours) : "");
    setActualHours(task.actualHours != null ? String(task.actualHours) : "");
    setDueDate(task.dueDate ?? "");
    setDescription(task.description ?? "");
    setActiveStatus(task.status);
  }, [task?.id]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleStatusClick = (status: TaskStatus) => {
    if (!task || status === activeStatus) return;
    setActiveStatus(status);
    updateStatus({ id: task.id, status });
  };

  const handleSave = () => {
    if (!task) return;
    const payload: TaskRequestPayload = {
      projectId:       task.projectId,
      title:           task.title,
      description:     description || undefined,
      assignedToId:    assignedToId || undefined,
      priority,
      status:          activeStatus,
      estimatedHours:  estimatedHours ? parseFloat(estimatedHours) : undefined,
      actualHours:     actualHours    ? parseFloat(actualHours)    : undefined,
      dueDate:         dueDate        || undefined,
    };
    updateTask({ id: task.id, payload }, { onSuccess: onClose });
  };

  const handleDelete = () => {
    if (!task) return;
    deleteTask(task.id, { onSuccess: onClose });
  };

  const memberOptions: SelectOption<string>[] = [
    { value: "", label: "Unassigned" },
    ...projectMembers.map((m) => ({ value: m.userId, label: m.fullName || m.email })),
  ];

  const currentAssigneeName = task?.assignedTo
    ? (projectMembers.find((m) => m.userId === task.assignedTo?.id)?.fullName ?? task.assignedTo.email)
    : "Unassigned";

  const statusBadgeClass = {
    [TaskStatus.TODO]:        "bg-slate-800 text-slate-400 border-slate-700",
    [TaskStatus.IN_PROGRESS]: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    [TaskStatus.DONE]:        "bg-blue-500/10 text-blue-400 border-blue-500/30",
    [TaskStatus.CANCELLED]:   "bg-red-500/10 text-red-400 border-red-500/30",
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-120 bg-[#111827] border-l border-[#1f2937] z-50",
          "flex flex-col shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-[#1f2937] flex items-start justify-between shrink-0">
          <div className="flex-1 min-w-0 pr-4">
            {task && (
              <div className="flex items-center gap-2 mb-2">
                <TaskPriorityBadge priority={task.priority} />
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                  statusBadgeClass[activeStatus],
                )}>
                  {STATUS_LABELS[activeStatus]}
                </span>
              </div>
            )}
            <h2 className="text-lg font-bold text-slate-100 leading-tight">
              {task?.title ?? "Task Details"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {/* Status toggles */}
          <section>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Update Status
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(TaskStatus) as TaskStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusClick(s)}
                  className={cn(
                    "px-3 py-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all",
                    activeStatus === s
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-[#1f2937] text-slate-500 hover:border-slate-600 hover:text-slate-300",
                  )}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </section>

          <div className="border-t border-[#1f2937]" />

          {/* Details */}
          <section className="space-y-4">
            {/* Assignee */}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                Assigned To
              </label>
              {isClient ? (
                <SelectDropdown
                  options={memberOptions}
                  value={assignedToId}
                  onChange={setAssignedToId}
                  placeholder="Select assignee"
                />
              ) : (
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-900/50 border border-[#1f2937] rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {currentAssigneeName.substring(0, 2).toUpperCase()}
                  </div>
                  <span className="text-sm text-slate-300">{currentAssigneeName}</span>
                </div>
              )}
            </div>

            {/* Due Date + Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Due Date
                </label>
                {isClient ? (
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-900/50 border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-900/50 border border-[#1f2937] rounded-xl text-sm text-slate-500 italic">
                    {dueDate || "No due date"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Priority
                </label>
                {isClient ? (
                  <SelectDropdown
                    options={PRIORITY_OPTIONS}
                    value={priority}
                    onChange={setPriority}
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-900/50 border border-[#1f2937] rounded-xl flex items-center">
                    <TaskPriorityBadge priority={priority} />
                  </div>
                )}
              </div>
            </div>

            {/* Est Hours + Act Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Est. Hours
                </label>
                {isClient ? (
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    className="w-full bg-slate-900/50 border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-slate-300 font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                    placeholder="0.0"
                  />
                ) : (
                  <div className="px-4 py-3 bg-slate-900/50 border border-[#1f2937] rounded-xl text-sm text-slate-500 italic font-mono">
                    {estimatedHours ? `${estimatedHours}h (Locked)` : "—"}
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
                  Act. Hours
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={actualHours}
                  onChange={(e) => setActualHours(e.target.value)}
                  className="w-full bg-slate-900/50 border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-emerald-400 font-mono focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                  placeholder="0.0"
                />
              </div>
            </div>
          </section>

          <div className="border-t border-[#1f2937]" />

          {/* Description */}
          <section>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">
              Description
            </label>
            {isClient ? (
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-900/50 border border-[#1f2937] rounded-xl px-4 py-3 text-sm text-slate-300 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none custom-scrollbar"
                placeholder="Add a description…"
              />
            ) : (
              <p className="text-sm text-slate-400 leading-relaxed min-h-15">
                {description || <span className="italic text-slate-600">No description.</span>}
              </p>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#1f2937] bg-[#0a0c10]/50 flex items-center gap-3 shrink-0">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl uppercase tracking-widest transition-colors"
          >
            {isSaving ? "Saving…" : "Save Changes"}
          </button>
          {isClient && (
            <button
              onClick={handleDelete}
              className="px-4 py-3 border border-red-500/30 text-red-400 hover:bg-red-500/10 font-bold text-xs rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>
    </>
  );
}
