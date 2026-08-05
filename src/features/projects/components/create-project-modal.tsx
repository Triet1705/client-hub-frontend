"use client";

import * as React from "react";
import { Check, Search, X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useCreateProjectMutation,
  useProjectMembersQuery,
  useTenantFreelancerSearchQuery,
  useUpdateProjectMutation,
} from "../hooks/use-projects";
import {
  projectSchema,
  type ProjectFormValues,
  type ProjectFormInputValues,
} from "../validations/project.schema";
import {
  ProjectStatus,
  type Project,
  type ProjectFreelancerCandidate,
  type ProjectRequestPayload,
} from "../types/project.types";

import { ModalShell } from "@/components/ui/modal-shell";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useAdminUsersQuery } from "@/features/admin/hooks/use-admin";
import { useAsyncSearch } from "@/hooks/use-async-search";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS: SelectOption<ProjectStatus>[] = [
  { value: ProjectStatus.PLANNING,    label: "Planning",    color: "text-content-secondary" },
  { value: ProjectStatus.IN_PROGRESS, label: "In Progress", color: "text-status-info-text"  },
  { value: ProjectStatus.ON_HOLD,     label: "On Hold",     color: "text-status-warning-text" },
  { value: ProjectStatus.COMPLETED,   label: "Completed",   color: "text-status-success-text" },
  { value: ProjectStatus.CANCELLED,   label: "Cancelled",   color: "text-status-danger-text" },
];

const VALID_STATUS_TRANSITIONS: Record<ProjectStatus, ProjectStatus[]> = {
  [ProjectStatus.PLANNING]: [ProjectStatus.PLANNING, ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.IN_PROGRESS]: [ProjectStatus.IN_PROGRESS, ProjectStatus.ON_HOLD, ProjectStatus.COMPLETED, ProjectStatus.CANCELLED],
  [ProjectStatus.ON_HOLD]: [ProjectStatus.ON_HOLD, ProjectStatus.IN_PROGRESS, ProjectStatus.CANCELLED],
  [ProjectStatus.COMPLETED]: [ProjectStatus.COMPLETED],
  [ProjectStatus.CANCELLED]: [ProjectStatus.CANCELLED],
};

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
}

export function CreateProjectModal({ isOpen, onClose, project }: CreateProjectModalProps) {
  const role = useAuthStore((state) => state.user?.role);
  const isAdmin = role === "ADMIN";
  const { mutate: createProject, isPending: isCreating } = useCreateProjectMutation();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProjectMutation();
  const isEditing = Boolean(project);
  const isPending = isCreating || isUpdating;
  const [ownerId, setOwnerId] = React.useState("");
  const [ownerError, setOwnerError] = React.useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = React.useState<ProjectFreelancerCandidate[]>([]);
  const [hasInteractedWithMemberSearch, setHasInteractedWithMemberSearch] = React.useState(false);
  const { keyword, setKeyword, normalizedKeyword, canSearch, minChars, resetSearch } = useAsyncSearch({
    debounceMs: 250,
    minChars: 2,
  });

  const { data: ownerPage, isLoading: isLoadingOwners } = useAdminUsersQuery(
    { page: 0, size: 100, role: "CLIENT", active: true, sortBy: "fullName", sortDir: "asc" },
    isOpen && isAdmin,
  );
  const { data: existingMembers = [] } = useProjectMembersQuery(project?.id ?? "");
  const { data: freelancerCandidates = [], isLoading: isSearchingFreelancers } =
    useTenantFreelancerSearchQuery(normalizedKeyword, isOpen && canSearch);

  const ownerOptions: SelectOption<string>[] = (ownerPage?.content ?? []).map((owner) => ({
    value: owner.id,
    label: owner.fullName ? `${owner.fullName} (${owner.email})` : owner.email,
  }));
  const unavailableMemberIds = React.useMemo(
    () => new Set(existingMembers.map((member) => member.userId)),
    [existingMembers],
  );
  const visibleFreelancers = freelancerCandidates.filter(
    (candidate) => !unavailableMemberIds.has(candidate.userId),
  );
  const selectedMemberIds = selectedMembers.map((member) => member.userId);

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
  const statusOptions = project
    ? STATUS_OPTIONS.filter((option) => VALID_STATUS_TRANSITIONS[project.status].includes(option.value))
    : STATUS_OPTIONS.filter((option) => option.value === ProjectStatus.PLANNING);

  React.useEffect(() => {
    if (!isOpen) return;
    reset({
      title: project?.title ?? "",
      description: project?.description ?? "",
      budget: project?.budget ?? "",
      deadline: project?.deadline ?? "",
      status: project?.status ?? ProjectStatus.PLANNING,
    });
    setOwnerId(project?.ownerId ?? "");
    setOwnerError(null);
    setSelectedMembers([]);
    setHasInteractedWithMemberSearch(false);
    resetSearch();
  }, [isOpen, project, reset, resetSearch]);

  const handleClose = () => {
    reset();
    resetSearch();
    setSelectedMembers([]);
    setHasInteractedWithMemberSearch(false);
    setOwnerError(null);
    onClose();
  };

  const onSubmit = (data: ProjectFormValues) => {
    if (isAdmin && !ownerId) {
      setOwnerError("Choose a client who will own this project.");
      return;
    }

    const payload: ProjectRequestPayload = {
      ...data,
      ownerId: isAdmin ? ownerId : undefined,
      memberIds: selectedMemberIds,
    };
    const mutationOptions = {
      onSuccess: () => {
        handleClose();
      },
    };

    if (project) {
      updateProject({ id: project.id, payload }, mutationOptions);
      return;
    }
    createProject(payload, mutationOptions);
  };

  const footer = (
    <>
      <Button
        variant="ghost"
        onClick={handleClose}
        disabled={isPending}
        className="px-6 text-content-secondary hover:text-content-primary"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="project-mutation-form"
        isLoading={isPending}
        className="px-6 font-bold"
      >
        {isPending ? "Saving..." : isEditing ? "Save Changes" : "Create Project"}
      </Button>
    </>
  );

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isPending={isPending}
      title={isEditing ? "Edit Project" : "Create New Project"}
      maxWidth="max-w-2xl"
      footer={footer}
    >
      <form id="project-mutation-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

        {isAdmin ? (
          <FormField label="Project Owner" required error={ownerError ?? undefined}>
            <SelectDropdown
              options={ownerOptions}
              value={ownerId}
              onChange={(value) => {
                setOwnerId(value);
                setOwnerError(null);
              }}
              placeholder="Select a client owner"
              loading={isLoadingOwners}
              disabled={isPending}
              isError={Boolean(ownerError)}
            />
          </FormField>
        ) : null}

        <FormField label="Add Freelancer Members">
          <div className="space-y-3">
            {selectedMembers.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedMembers.map((candidate) => (
                  <span
                    key={candidate.userId}
                    className="inline-flex items-center gap-2 rounded-full border border-theme-border bg-surface-elevated px-3 py-1.5 text-xs text-content-secondary"
                  >
                    {candidate.fullName || candidate.email}
                    <button
                      type="button"
                      aria-label={`Remove ${candidate.fullName || candidate.email}`}
                      onClick={() => setSelectedMembers((members) =>
                        members.filter((member) => member.userId !== candidate.userId),
                      )}
                      className="text-content-muted transition-colors hover:text-status-danger-text"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            ) : null}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted" />
              <input
                type="search"
                value={keyword}
                onChange={(event) => {
                  setKeyword(event.target.value);
                  setHasInteractedWithMemberSearch(true);
                }}
                placeholder="Search freelancer by name or email"
                disabled={isPending}
                className="w-full rounded-xl border border-theme-border bg-surface py-3 pl-10 pr-4 text-sm text-content-primary outline-none transition-colors placeholder:text-content-muted focus:border-theme-accent"
              />
            </div>

            {hasInteractedWithMemberSearch ? (
              <div className="max-h-44 overflow-y-auto rounded-xl border border-theme-border bg-surface/40 custom-scrollbar">
                {!canSearch ? (
                  <p className="px-4 py-3 text-xs text-content-muted">
                    Type at least {minChars} characters to search.
                  </p>
                ) : isSearchingFreelancers ? (
                  <p className="px-4 py-3 text-xs text-content-muted">Searching freelancers...</p>
                ) : visibleFreelancers.length === 0 ? (
                  <p className="px-4 py-3 text-xs text-content-muted">No available freelancer found.</p>
                ) : (
                  visibleFreelancers.map((candidate) => {
                  const isSelected = selectedMemberIds.includes(candidate.userId);
                  return (
                    <button
                      key={candidate.userId}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setSelectedMembers((members) =>
                        isSelected
                          ? members.filter((member) => member.userId !== candidate.userId)
                          : [...members, candidate],
                      )}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 border-b border-theme-border px-4 py-3 text-left transition-colors last:border-b-0",
                        isSelected ? "bg-action-subtle" : "hover:bg-surface-elevated/60",
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium text-content-secondary">
                          {candidate.fullName || candidate.email}
                        </span>
                        <span className="block truncate text-xs text-content-muted">{candidate.email}</span>
                      </span>
                      {isSelected ? <Check size={14} className="shrink-0 text-theme-accent" /> : null}
                    </button>
                  );
                  })
                )}
              </div>
            ) : null}
            {project && existingMembers.length > 0 ? (
              <p className="text-xs text-content-muted">
                Existing project members remain assigned. Select additional freelancers above.
              </p>
            ) : null}
          </div>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <FormField label={isEditing ? "Status" : "Initial Status"} error={errors.status?.message}>
          <SelectDropdown
            options={statusOptions}
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
