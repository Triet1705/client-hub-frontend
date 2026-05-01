export interface ExtractedTask {
  id: string; // temporary frontend ID
  title: string;
  description: string;
  estimatedHours: number | null;
  suggestedPriority: string;
}

export interface SmartTaskHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "completed" | "error" | "processing";
  extractedTasks?: ExtractedTask[];
  error?: string;
}

export interface ExtractTasksResponse {
  extractedTasks: {
    title: string;
    description: string;
    estimatedHours: number;
    suggestedPriority: string;
  }[];
  confidenceScore: number;
}
