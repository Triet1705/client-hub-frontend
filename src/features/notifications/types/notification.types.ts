export interface NotificationItem {
  id: number;
  message: string;
  type: string; // NEW_COMMENT, TASK_ASSIGNED, TASK_COMPLETED, PROJECT_COMPLETED, INVOICE_PAID, etc.
  referenceId: string | null;
  referenceType: string | null; // TASK, PROJECT, INVOICE
  read: boolean;
  createdAt: string;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface MarkAllReadResponse {
  updatedCount: number;
}
