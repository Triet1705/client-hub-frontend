import { apiClient } from "@/lib/axios";
import { TaskExtractionResult } from "../types/smart-tasks.types";

export const smartTasksApi = {
  extractTasks: async (file: File): Promise<TaskExtractionResult> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<TaskExtractionResult>(
      "/ai/extract-task",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 180_000, // Override global 15s timeout for long-running AI extraction
      }
    );
    return response.data;
  },
};
