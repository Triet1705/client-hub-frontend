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
  title: string;
  description: string;
  priority: string;
  estimatedHours: number | null;
  confidenceScore: number;
}
