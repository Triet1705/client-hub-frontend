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
  documentSummary: string;
  overallConfidence: number;
  reviewPassTriggered: boolean;
  processingTimeMs: number;
  tasks: Array<{
    title: string;
    description: string;
    priority: string;
    estimatedHours: number | null;
    confidenceScore: number;
  }>;
}
