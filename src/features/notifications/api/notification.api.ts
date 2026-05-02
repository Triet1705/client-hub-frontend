import { apiClient } from "@/lib/axios";
import type { PageResponse } from "@/lib/type";
import type { NotificationItem, UnreadCountResponse, MarkAllReadResponse } from "../types/notification.types";

const NOTIFICATIONS_BASE = "/notifications";

export async function fetchNotifications(
  unreadOnly: boolean = false,
  page: number = 0,
  size: number = 20
): Promise<PageResponse<NotificationItem>> {
  const { data } = await apiClient.get<PageResponse<NotificationItem>>(NOTIFICATIONS_BASE, {
    params: {
      unreadOnly,
      page,
      size,
    },
  });
  return data;
}

export async function fetchUnreadCount(): Promise<UnreadCountResponse> {
  const { data } = await apiClient.get<UnreadCountResponse>(`${NOTIFICATIONS_BASE}/unread-count`);
  return data;
}

export async function markNotificationAsRead(id: number): Promise<NotificationItem> {
  const { data } = await apiClient.patch<NotificationItem>(`${NOTIFICATIONS_BASE}/${id}/read`);
  return data;
}

export async function markAllNotificationsAsRead(): Promise<MarkAllReadResponse> {
  const { data } = await apiClient.patch<MarkAllReadResponse>(`${NOTIFICATIONS_BASE}/read-all`);
  return data;
}
