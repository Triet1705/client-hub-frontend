"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateProjectMutation } from "../hooks/use-projects";
import {
  projectSchema,
  type ProjectFormValues,
  type ProjectFormInputValues,
} from "../validations/project.schema";
import { ProjectStatus } from "../types/project.types";

import { ModalShell } from "@/components/ui/modal-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS: SelectOption<ProjectStatus>[] = [
  { value: ProjectStatus.PLANNING,    label: "Planning",    color: "text-slate-300" },
  { value: ProjectStatus.IN_PROGRESS, label: "In Progress", color: "text-blue-400"  },
  { value: ProjectStatus.ON_HOLD,     label: "On Hold",     color: "text-amber-400" },
];

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const { mutate: createProject, isPending } = useCreateProjectMutation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormInputValues, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      deadline: "",
      status: ProjectStatus.PLANNING,
    },
  });

  const statusValue = useWatch({ control, name: "status" }) ?? ProjectStatus.PLANNING;
  const deadlineValue = useWatch({ control, name: "deadline" }) ?? "";

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (data: ProjectFormValues) => {
    createProject(data, {
      onSuccess: () => {
        handleClose();
      },
    });
  };

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
        form="create-project-form"
        isLoading={isPending}
        className="px-6 font-bold"
      >
        {isPending ? "Provisioning..." : "Create Project"}
      </Button>
    </>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isPending={isPending}
      title="Create New Project"
      footer={footer}
    >
      <form id="create-project-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormField label="Project Name" required error={errors.title?.message}>
          <Input
            {...register("title")}
            placeholder="e.g. Mobile App Redesign"
            isError={!!errors.title}
            disabled={isPending}
          />
        </FormField>

        <FormField label="Description" error={errors.description?.message}>
          <Textarea
            {...register("description")}
            placeholder="Provide a brief overview of the project..."
            rows={3}
            isError={!!errors.description}
            disabled={isPending}
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Budget (USD)" error={errors.budget?.message}>
            <CurrencyInput
              {...register("budget")}
              placeholder="0.00"
              isError={!!errors.budget}
              disabled={isPending}
            />
          </FormField>

          <FormField label="Deadline" error={errors.deadline?.message}>
            <DatePicker
              value={deadlineValue}
              onChange={(val) => setValue("deadline", val, { shouldValidate: true })}
              isError={!!errors.deadline}
              disabled={isPending}
            />
            <input type="hidden" {...register("deadline")} />
          </FormField>
        </div>

        <FormField label="Initial Status" error={errors.status?.message}>
          <SelectDropdown
            options={STATUS_OPTIONS}
            value={statusValue}
            onChange={(val) => setValue("status", val as ProjectStatus, { shouldValidate: true })}
            disabled={isPending}
          />
          <input type="hidden" {...register("status")} />
        </FormField>
      </form>
    </ModalShell>
  );
}