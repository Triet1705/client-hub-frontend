export interface DashboardStats {
  activeProjects: number;
  pendingTasks: number;
  awaitingPaymentAmount: string; // BigDecimal from backend — kept as string per §4.1
  escrowLocked: string;         // BigDecimal; always 0 until M3
}

export interface TaskSummary {
  todo: number;
  inProgress: number;
  done: number;
  total: number;
}