import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchProjects, createProject, deleteProject } from "../api/project.api";
import type { ProjectRequestPayload } from "../types/project.types";
import { toast } from "sonner";

export const projectKeys = {
  all: ["projects"] as const,
  lists: () => [...projectKeys.all, "list"] as const,
  detail: (id: string) => [...projectKeys.all, "detail", id] as const,
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
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to create project.";
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
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Failed to delete project.";
      toast.error("Deletion Failed", { description: errorMsg });
    },
  });
}