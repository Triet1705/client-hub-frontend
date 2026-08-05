import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api/error";
import {
  fetchProjects,
  createProject,
  updateProject,
  deleteProject,
  fetchProjectById,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  fetchProjectInvoices,
  fetchProjectProgress,
  fetchProjectFiles,
  fetchProjectActivity,
  searchProjectFreelancers,
  searchTenantFreelancers,
  fetchProjectActivityProof,
  verifyProjectActivityProof,
} from "../api/project.api";
import type { ProjectRequestPayload } from "../types/project.types";
import { toast } from "sonner";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  members: (id: string) => [...projectKeys.all, "detail", id, "members"] as const,
  invoices: (id: string) => [...projectKeys.all, "detail", id, "invoices"] as const,
  progress: (id: string) => [...projectKeys.all, "detail", id, "progress"] as const,
  files: (id: string) => [...projectKeys.all, "detail", id, "files"] as const,
  activity: (id: string) => [...projectKeys.all, "detail", id, "activity"] as const,
  activityProof: (id: string, auditLogId: number) => [...projectKeys.activity(id), "proof", auditLogId] as const,
  freelancerSearch: (id: string, keyword: string) => [...projectKeys.all, "detail", id, "freelancer-search", keyword] as const,
  tenantFreelancerSearch: (keyword: string) => [...projectKeys.all, "tenant-freelancer-search", keyword] as const,
};

export function useProjectsQuery(page = 0, size = 20) {
  return useQuery({
    queryKey: [...projectKeys.lists(), { page, size }],
    queryFn: () => fetchProjects(page, size),
    placeholderData: (prev) => prev,
    select: (data) => ({
      ...data,
      currentPage: data.pageable.pageNumber,
    }),
  });
}

export function useProjectDetailQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => fetchProjectById(id),
    enabled: !!id,
  });
}

export function useProjectMembersQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.members(id),
    queryFn: () => fetchProjectMembers(id),
    enabled: !!id,
  });
}

export function useProjectInvoicesQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.invoices(id),
    queryFn: () => fetchProjectInvoices(id),
    enabled: !!id,
  });
}

export function useProjectProgressQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.progress(id),
    queryFn: () => fetchProjectProgress(id),
    enabled: !!id,
  });
}

export function useProjectFilesQuery(id: string) {
  return useQuery({
    queryKey: projectKeys.files(id),
    queryFn: () => fetchProjectFiles(id),
    enabled: !!id,
  });
}

export function useProjectActivityQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: projectKeys.activity(id),
    queryFn: () => fetchProjectActivity(id),
    enabled: enabled && !!id,
    staleTime: 0,
  });
}

export function useProjectActivityProofQuery(projectId: string, auditLogId: number, enabled: boolean) {
  return useQuery({
    queryKey: projectKeys.activityProof(projectId, auditLogId),
    queryFn: () => fetchProjectActivityProof(projectId, auditLogId),
    enabled: enabled && Boolean(projectId) && auditLogId > 0,
  });
}

export function useVerifyProjectActivityProofMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (auditLogId: number) => verifyProjectActivityProof(projectId, auditLogId),
    onSuccess: (proof) => {
      if (proof.auditLogId) queryClient.setQueryData(projectKeys.activityProof(projectId, proof.auditLogId), proof);
      queryClient.invalidateQueries({ queryKey: projectKeys.activity(projectId) });
    },
  });
}

export function useProjectFreelancerSearchQuery(id: string, keyword: string, enabled = true) {
  const normalizedKeyword = keyword.trim();
  return useQuery({
    queryKey: projectKeys.freelancerSearch(id, normalizedKeyword),
    queryFn: () => searchProjectFreelancers(id, normalizedKeyword),
    enabled: enabled && !!id && normalizedKeyword.length >= 2,
    placeholderData: (prev) => prev,
  });
}

export function useCreateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectRequestPayload) => createProject(payload),
    onSuccess: (newProject) => {
      toast.success("Project Created", {
        description: `${newProject.title} has been successfully provisioned.`,
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const status = getApiErrorStatus(error);
      if (status === 403) {
        toast.error("Access Denied", {
          description: "Your account is not allowed to create projects.",
        });
        return;
      }
      const errorMsg = getApiErrorMessage(error, "Failed to create project.");
      toast.error("Creation Failed", { description: errorMsg });
    },
  });
}

export function useTenantFreelancerSearchQuery(keyword: string, enabled = true) {
  const normalizedKeyword = keyword.trim();
  return useQuery({
    queryKey: projectKeys.tenantFreelancerSearch(normalizedKeyword),
    queryFn: () => searchTenantFreelancers(normalizedKeyword),
    enabled,
    placeholderData: (prev) => prev,
  });
}

export function useUpdateProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ProjectRequestPayload }) =>
      updateProject(id, payload),
    onSuccess: (updatedProject, variables) => {
      toast.success("Project Updated", {
        description: `${updatedProject.title} has been saved.`,
      });
      queryClient.setQueryData(projectKeys.detail(variables.id), updatedProject);
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.members(variables.id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
      queryClient.invalidateQueries({ queryKey: projectKeys.activity(variables.id) });
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to update project.");
      toast.error("Update Failed", { description: errorMsg });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: (_, projectId) => {
      toast.success("Project Deleted");
      queryClient.removeQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ["admin", "projects"] });
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to delete project.");
      toast.error("Deletion Failed", { description: errorMsg });
    },
  });
}

export function useAddMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => addProjectMember(projectId, userId),
    onSuccess: () => {
      toast.success("Member added");
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, "Failed to add member.");
      toast.error("Error", { description: msg });
    },
  });
}

export function useRemoveMemberMutation(projectId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => removeProjectMember(projectId, userId),
    onSuccess: () => {
      toast.success("Member removed");
      queryClient.invalidateQueries({ queryKey: projectKeys.members(projectId) });
    },
    onError: (error: unknown) => {
      const msg = getApiErrorMessage(error, "Failed to remove member.");
      toast.error("Error", { description: msg });
    },
  });
}
