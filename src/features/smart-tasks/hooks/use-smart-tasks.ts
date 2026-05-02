import { useMutation } from "@tanstack/react-query";
import { smartTasksApi } from "../api/smart-tasks.api";

export function useExtractTasksMutation() {
  return useMutation({
    mutationFn: smartTasksApi.extractTasks,
  });
}
