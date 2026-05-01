import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../api/notification.api";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (unreadOnly: boolean) => [...notificationKeys.all, "list", unreadOnly] as const,
  unreadCount: () => [...notificationKeys.all, "unreadCount"] as const,
};

export function useNotificationsQuery(unreadOnly: boolean = false) {
  return useQuery({
    queryKey: notificationKeys.list(unreadOnly),
    queryFn: () => fetchNotifications(unreadOnly),
    refetchInterval: 30_000, // Refetch every 30 seconds
  });
}

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: fetchUnreadCount,
    refetchInterval: 15_000, // Refetch every 15 seconds
  });
}

export function useMarkReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Unable to mark notification as read.");
      toast.error("Failed", { description: message });
    },
  });
}

export function useMarkAllReadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
      toast.success("All notifications marked as read");
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Unable to mark all as read.");
      toast.error("Failed", { description: message });
    },
  });
}
