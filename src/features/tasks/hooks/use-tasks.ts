import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  fetchTasks,
  fetchTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  assignTask
} from "../api/task.api";
import type { FetchTasksParams, TaskRequestPayload, TaskStatus, TaskPageResponse } from "../types/task.types";
import { projectKeys } from "@/features/projects/hooks/use-projects";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: FetchTasksParams) => [...taskKeys.all, "list", params] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};

export function useTasksQuery(params: FetchTasksParams) {
  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
    placeholderData: keepPreviousData,
  });
}

export function useTaskQuery(id?: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => fetchTaskById(id!),
    enabled: Boolean(id),
  });
}

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: TaskRequestPayload) => createTask(payload),
    onSuccess: (newTask, variables) => {
      toast.success("Task Created", { description: `${newTask.title} added successfully.` });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: projectKeys.activity(newTask.projectId || variables.projectId),
        exact: true,
      });
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to create task.");
      toast.error("Error", { description: errorMsg });
    },
  });
}

export function useUpdateTaskStatusMutation(currentParams: FetchTasksParams) {
  const queryClient = useQueryClient();
  const queryKeyToUpdate = taskKeys.list(currentParams);

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) => updateTaskStatus(id, status),
    
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: queryKeyToUpdate });

      const previousTasks = queryClient.getQueryData<TaskPageResponse>(queryKeyToUpdate);

      if (previousTasks) {
        queryClient.setQueryData<TaskPageResponse>(queryKeyToUpdate, {
          ...previousTasks,
          content: previousTasks.content.map(task => 
            task.id === id ? { ...task, status } : task
          )
        });
      }

      return { previousTasks };
    },

    onError: (err: unknown, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(queryKeyToUpdate, context.previousTasks);
      }
      const errorMsg = getApiErrorMessage(err, "Invalid state transition.");
      toast.error("Update Failed", { description: errorMsg });
    },

    onSuccess: () => {
      if (currentParams.projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.activity(currentParams.projectId),
          exact: true,
        });
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeyToUpdate });
    }
  });
}

export function useAssignTaskMutation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => assignTask(id, userId),
    onSuccess: () => {
      toast.success("Task Assigned");
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.activity(projectId),
          exact: true,
        });
      }
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to assign task.");
      toast.error("Assignment Failed", { description: errorMsg });
    }
  });
}

export function useDeleteTaskMutation(projectId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => {
      toast.success("Task Deleted");
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      if (projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.activity(projectId),
          exact: true,
        });
      }
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to delete task.");
      toast.error("Deletion Failed", { description: errorMsg });
    },
  });
}

export function useUpdateTaskMutation(currentParams: FetchTasksParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskRequestPayload }) =>
      updateTask(id, payload),
    onSuccess: () => {
      toast.success("Task Updated");
      queryClient.invalidateQueries({ queryKey: taskKeys.list(currentParams) });
      if (currentParams.projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.activity(currentParams.projectId),
          exact: true,
        });
      }
    },
    onError: (error: unknown) => {
      const errorMsg = getApiErrorMessage(error, "Failed to update task.");
      toast.error("Update Failed", { description: errorMsg });
    },
  });
}
