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
import { useRealtimeConnection } from "@/features/realtime/context/realtime-provider";
import { useAuthStore } from "@/features/auth/store/auth.store";
import * as React from "react";

export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (params: FetchTasksParams) => [...taskKeys.all, "list", params] as const,
  detail: (id: string) => [...taskKeys.all, "detail", id] as const,
};

export function useTasksQuery(params: FetchTasksParams) {
  const queryClient = useQueryClient();
  const { isConnected, subscribe } = useRealtimeConnection();
  const user = useAuthStore((state) => state.user);

  React.useEffect(() => {
    if (!isConnected || !user?.id) {
      return;
    }

    const destination =
      user.role === "ADMIN" && params.projectId
        ? `/topic/projects/${params.projectId}/tasks`
        : `/topic/users/${user.id}/tasks`;

    return subscribe(destination, (message) => {
      let taskId: string | undefined;
      try {
        taskId = (JSON.parse(message.body) as { id?: string }).id;
      } catch {
        // A malformed optional push never replaces the REST source of truth.
      }
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      if (taskId) {
        void queryClient.invalidateQueries({
          queryKey: taskKeys.detail(taskId),
        });
      }
      if (params.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.activity(params.projectId),
          exact: true,
        });
      }
    });
  }, [
    isConnected,
    params.projectId,
    queryClient,
    subscribe,
    user?.id,
    user?.role,
  ]);

  return useQuery({
    queryKey: taskKeys.list(params),
    queryFn: () => fetchTasks(params),
    placeholderData: keepPreviousData,
    refetchInterval: isConnected ? false : 10_000,
  });
}

export function useTaskQuery(id?: string | null) {
  const { isConnected } = useRealtimeConnection();
  return useQuery({
    queryKey: taskKeys.detail(id ?? ""),
    queryFn: () => fetchTaskById(id!),
    enabled: Boolean(id),
    refetchInterval: isConnected ? false : 10_000,
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
