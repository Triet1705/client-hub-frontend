import { apiClient } from "@/lib/api-client";
import { ExtractTasksResponse } from "../types/smart-tasks.types";

export const smartTasksApi = {
  extractTasks: async (file: File): Promise<ExtractTasksResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ExtractTasksResponse>(
      "/api/ai/extract-task",
      formData
    );
    return response.data;
  },
};
