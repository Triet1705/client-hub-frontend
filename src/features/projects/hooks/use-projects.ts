import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getApiErrorMessage, getApiErrorStatus } from "@/lib/api/error";
import {
  fetchProjects,
  createProject,
  deleteProject,
  fetchProjectById,
  fetchProjectMembers,
  addProjectMember,
  removeProjectMember,
  fetchProjectInvoices,
  searchProjectFreelancers,
} from "../api/project.api";
import type { ProjectRequestPayload } from "../types/project.types";
import { toast } from "sonner";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
  members: (id: string) => [...projectKeys.all, "detail", id, "members"] as const,
  invoices: (id: string) => [...projectKeys.all, "detail", id, "invoices"] as const,
  freelancerSearch: (id: string, keyword: string) => [...projectKeys.all, "detail", id, "freelancer-search", keyword] as const,
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
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      const status = getApiErrorStatus(error);
      if (status === 403) {
        toast.error("Access Denied", {
          description: "Only clients can create projects.",
        });
        return;
      }
      const errorMsg = getApiErrorMessage(error, "Failed to create project.");
      toast.error("Creation Failed", { description: errorMsg });
    },
  });
}

export function useDeleteProjectMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      toast.success("Project Deleted");
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
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
