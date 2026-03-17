"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";

import { ModalShell } from "@/components/ui/modal-shell";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { FormField } from "@/components/ui/form-field";
import { useCreateTaskMutation } from "../hooks/use-tasks";
import {
  taskSchema,
  type TaskFormValues,
  type TaskFormInputValues,
} from "../validations/task.schema";
import { TaskStatus, TaskPriority, type TaskRequestPayload } from "../types/task.types";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useProjectMembersQuery } from "@/features/projects/hooks/use-projects";

const PRIORITY_OPTIONS: SelectOption<TaskPriority>[] = [
  { value: TaskPriority.LOW,    label: "Low",    color: "text-slate-400"  },
  { value: TaskPriority.MEDIUM, label: "Medium", color: "text-amber-400"  },
  { value: TaskPriority.HIGH,   label: "High",   color: "text-orange-400" },
  { value: TaskPriority.URGENT, label: "Urgent", color: "text-rose-400"   },
];

const TASK_STATUS_OPTIONS: SelectOption<TaskStatus>[] = [
  { value: TaskStatus.TODO,        label: "To Do",       color: "text-slate-400"   },
  { value: TaskStatus.IN_PROGRESS, label: "In Progress", color: "text-blue-400"    },
  { value: TaskStatus.DONE,        label: "Done",        color: "text-emerald-400" },
  { value: TaskStatus.CANCELED,    label: "Cancelled",   color: "text-rose-400"    },
];

const INPUT_CLS =
  "w-full bg-slate-900/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all";

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultStatus?: TaskStatus;
}

export function CreateTaskModal({
  isOpen,
  onClose,
  defaultStatus = TaskStatus.TODO,
}: CreateTaskModalProps) {
  const { mutate: createTask, isPending } = useCreateTaskMutation();
  const { data: projectsData, isLoading: isLoadingProjects } = useProjectsQuery(0, 50);
  const projects = projectsData?.content ?? [];

  const projectOptions: SelectOption[] = projects.map((p) => ({
    value: p.id,
    label: p.title,
  }));

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<TaskFormInputValues, unknown, TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      projectId: "",
      priority: TaskPriority.MEDIUM,
      status: defaultStatus,
      estimatedHours: null,
      dueDate: "",
    },
  });

  const priorityValue  = useWatch({ control, name: "priority" })  ?? TaskPriority.MEDIUM;
  const statusValue    = useWatch({ control, name: "status" })     ?? defaultStatus;
  const projectIdValue = useWatch({ control, name: "projectId" })  ?? "";
  const assignedToValue = useWatch({ control, name: "assignedToId" }) ?? "";
  const { data: projectMembers = [], isLoading: isLoadingMembers } = useProjectMembersQuery(projectIdValue);

  const assigneeOptions = React.useMemo<SelectOption<string>[]>(
    () => [
      { value: "", label: "Unassigned" },
      ...projectMembers
        .filter((member) => member.role === "FREELANCER")
        .map((member) => ({ value: member.userId, label: member.fullName || member.email })),
    ],
    [projectMembers],
  );

  React.useEffect(() => {
    if (isOpen) reset((prev) => ({ ...prev, status: defaultStatus }));
  }, [isOpen, defaultStatus, reset]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (!projectIdValue) {
      if (assignedToValue) {
        setValue("assignedToId", undefined, { shouldValidate: true });
      }
      return;
    }

    if (!assignedToValue) {
      return;
    }

    const isStillValid = assigneeOptions.some((opt) => opt.value === assignedToValue);
    if (!isStillValid) {
      setValue("assignedToId", undefined, { shouldValidate: true });
    }
  }, [isOpen, projectIdValue, assignedToValue, assigneeOptions, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: TaskFormValues) => {
    const payload: TaskRequestPayload = {
      projectId:      data.projectId,
      title:          data.title,
      description:    data.description    ?? undefined,
      assignedToId:   data.assignedToId   ?? undefined,
      priority:       data.priority,
      status:         data.status,
      estimatedHours: data.estimatedHours ?? undefined,
      actualHours:    data.actualHours    ?? undefined,
      dueDate:        data.dueDate        ? data.dueDate : undefined,
    };
    createTask(payload, { onSuccess: () => handleClose() });
  };

  // ── footer ───────────────────────────────────────────────────────────────
  const footer = (
    <>
      <button
        type="button"
        onClick={handleClose}
        disabled={isPending}
        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        form="create-task-form"
        disabled={isPending}
        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Creating…
          </>
        ) : (
          "Create Task"
        )}
      </button>
    </>
  );

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isPending={isPending}
      title="Create New Task"
      footer={footer}
    >
      <form id="create-task-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">

        {/* Project */}
        <FormField label="Project" required error={errors.projectId?.message}>
          <SelectDropdown
            options={projectOptions}
            value={projectIdValue}
            onChange={(v) => setValue("projectId", v, { shouldValidate: true })}
            placeholder="— Select a project —"
            loading={isLoadingProjects}
            isError={!!errors.projectId}
          />
          <input type="hidden" {...register("projectId")} />
        </FormField>

        {/* Title */}
        <FormField label="Task Title" required error={errors.title?.message}>
          <input
            {...register("title")}
            type="text"
            placeholder="e.g. Implement Web3 login"
            className={cn(INPUT_CLS, errors.title ? "border-rose-500 focus:border-rose-500" : "")}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <textarea
            {...register("description")}
            rows={3}
            placeholder="What needs to be done?"
            className={cn(INPUT_CLS, "resize-none")}
          />
        </FormField>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Priority">
            <SelectDropdown
              options={PRIORITY_OPTIONS}
              value={priorityValue}
              onChange={(v) => setValue("priority", v as TaskPriority, { shouldValidate: true })}
              disabled={isPending}
            />
            <input type="hidden" {...register("priority")} />
          </FormField>

          <FormField label="Status">
            <SelectDropdown
              options={TASK_STATUS_OPTIONS}
              value={statusValue}
              onChange={(v) => setValue("status", v as TaskStatus, { shouldValidate: true })}
              disabled={isPending}
            />
            <input type="hidden" {...register("status")} />
          </FormField>
        </div>

        {/* Assignee (scoped by selected project members) */}
        <FormField label="Assignee">
          <SelectDropdown
            options={assigneeOptions}
            value={assignedToValue}
            onChange={(v) => setValue("assignedToId", v || undefined, { shouldValidate: true })}
            placeholder={projectIdValue ? "Select assignee" : "Pick a project first"}
            loading={!!projectIdValue && isLoadingMembers}
            disabled={!projectIdValue}
          />
          <input type="hidden" {...register("assignedToId")} />
        </FormField>

        {/* Est. Hours + Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Est. Hours">
            <input
              {...register("estimatedHours", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.5"
              placeholder="0.0"
              className={cn(INPUT_CLS, "font-mono")}
            />
          </FormField>
          <FormField label="Due Date" error={errors.dueDate?.message}>
            <input
              {...register("dueDate")}
              type="date"
              className={cn(INPUT_CLS, "scheme-dark")}
            />
          </FormField>
        </div>

      </form>
    </ModalShell>
  );
}