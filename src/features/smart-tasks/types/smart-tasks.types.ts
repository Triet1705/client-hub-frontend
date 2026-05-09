export interface ExtractedTask {
  id: string; // temporary frontend ID
  title: string;
  description: string;
  estimatedHours: number | null;
  suggestedPriority: string;
  confidenceScore?: number;
}

export interface SmartTaskHistoryItem {
  id: string;
  fileName: string;
  uploadedAt: string;
  status: "completed" | "error" | "processing";
  extractedTasks?: ExtractedTask[];
  error?: string;
}

// Matches backend TaskExtractionResult
export interface TaskExtractionResult {
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

// Legacy single-task response (kept for backward compat)
export interface ExtractTasksResponse {
  title: string;
  description: string;
  priority: string;
  estimatedHours: number | null;
  confidenceScore: number;
}
