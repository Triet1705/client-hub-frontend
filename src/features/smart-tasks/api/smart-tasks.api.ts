import { apiClient } from "@/lib/axios";
import { ExtractTasksResponse } from "../types/smart-tasks.types";

export const smartTasksApi = {
  extractTasks: async (file: File): Promise<ExtractTasksResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ExtractTasksResponse>(
      "/ai/extract-task",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },
};
