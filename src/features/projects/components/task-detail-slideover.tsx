"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { Task, TaskStatus, TaskPriority, type TaskRequestPayload, type FetchTasksParams } from "@/features/tasks/types/task.types";
import { TaskPriorityBadge } from "@/features/tasks/components/task-priority-badge";
import { TaskDetailLayout } from "@/features/tasks/components/task-detail-layout";
import { TaskStatusBadge } from "@/features/tasks/components/task-status-badge";
import { TaskStatusSelector } from "@/features/tasks/components/task-status-selector";
import { UserAvatar } from "@/components/ui/user-avatar";
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

  React.useEffect(() => {
    if (!task) return;
    setAssignedToId(task.assignedTo?.id ?? "");
    setPriority(task.priority);
    setEstimatedHours(task.estimatedHours != null ? String(task.estimatedHours) : "");
    setActualHours(task.actualHours != null ? String(task.actualHours) : "");
    setDueDate(task.dueDate ? task.dueDate.slice(0, 10) : "");
    setDescription(task.description ?? "");
    setActiveStatus(task.status);
  }, [task]);

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

  const headerBadge = task ? (
    <div className="flex items-center gap-2">
      <TaskPriorityBadge priority={task.priority} />
      <TaskStatusBadge status={activeStatus} />
    </div>
  ) : null;

  const footer = (
    <>
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-black font-bold text-xs rounded-xl uppercase tracking-widest transition-colors"
      >
        {isSaving ? "Saving..." : "Save Changes"}
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
    </>
  );

  return (
    <TaskDetailLayout
      isOpen={isOpen}
      title={task?.title ?? "Task Details"}
      onClose={onClose}
      headerBadge={headerBadge}
      footer={footer}
    >
          <section>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
              Update Status
            </p>
            <TaskStatusSelector activeStatus={activeStatus} onStatusChange={handleStatusClick} />
          </section>

          <div className="border-t border-[#1f2937]" />

          <section className="space-y-4">
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
                  <UserAvatar name={currentAssigneeName} />
                  <span className="text-sm text-slate-300">{currentAssigneeName}</span>
                </div>
              )}
            </div>

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

          <div className="border-t border-[#1f2937]" />

          <section className="space-y-2">
            <p className="text-[10px] text-slate-500">
              Created by <span className="text-slate-300">{task?.createdBy ?? "Unknown"}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              Last updated by <span className="text-slate-300">{task?.lastModifiedBy ?? "Unknown"}</span>
            </p>
          </section>
    </TaskDetailLayout>
  );
}
