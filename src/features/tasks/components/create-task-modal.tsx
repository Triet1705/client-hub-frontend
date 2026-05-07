"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { ModalShell } from "@/components/ui/modal-shell";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { useCreateTaskMutation } from "../hooks/use-tasks";
import {
  taskSchema,
  type TaskFormValues,
  type TaskFormInputValues,
} from "../validations/task.schema";
import { TaskStatus, TaskPriority, type TaskRequestPayload } from "../types/task.types";
import { TASK_PRIORITY_OPTIONS, TASK_STATUS_OPTIONS } from "../constants/task-ui.constants";
import { Button } from "@/components/ui/button";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useProjectMembersQuery } from "@/features/projects/hooks/use-projects";
import { useAuthStore } from "@/features/auth/store/auth.store";



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
  const { user } = useAuthStore();
  const canAssignOthers = user?.role === "CLIENT" || user?.role === "ADMIN";
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
      assignedToId:   canAssignOthers ? (data.assignedToId ?? undefined) : (user?.id ?? undefined),
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
      <Button
        variant="ghost"
        onClick={handleClose}
        disabled={isPending}
        className="px-6 text-slate-400 hover:text-white"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-task-form"
        isLoading={isPending}
        className="px-6 font-bold"
      >
        {isPending ? "Creating…" : "Create Task"}
      </Button>
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
          <Input
            {...register("title")}
            type="text"
            placeholder="e.g. Implement Web3 login"
            isError={!!errors.title}
            disabled={isPending}
          />
        </FormField>

        {/* Description */}
        <FormField label="Description">
          <Textarea
            {...register("description")}
            rows={3}
            placeholder="What needs to be done?"
            disabled={isPending}
          />
        </FormField>

        {/* Priority + Status */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Priority">
            <SelectDropdown
              options={TASK_PRIORITY_OPTIONS}
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

        {canAssignOthers ? (
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
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Est. Hours">
            <Input
              {...register("estimatedHours", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.5"
              placeholder="0.0"
              className="font-mono"
              disabled={isPending}
            />
          </FormField>
          <FormField label="Due Date" error={errors.dueDate?.message}>
            <DatePicker
              value={useWatch({ control, name: "dueDate" }) ?? ""}
              onChange={(val) => setValue("dueDate", val, { shouldValidate: true })}
              isError={!!errors.dueDate}
              disabled={isPending}
            />
            <input type="hidden" {...register("dueDate")} />
          </FormField>
        </div>

      </form>
    </ModalShell>
  );
}