"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";
import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";
import { projectKeys } from "@/features/projects/hooks/use-projects";
import { taskKeys } from "@/features/tasks/hooks/use-tasks";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useRealtimeConnection } from "../context/realtime-provider";

type RealtimeEntityMessage = {
  id?: string | number;
  projectId?: string;
};

function parseMessage(body: string): RealtimeEntityMessage {
  try {
    return JSON.parse(body) as RealtimeEntityMessage;
  } catch {
    return {};
  }
}

export function RealtimeCacheSync() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const { isConnected, subscribe } = useRealtimeConnection();

  React.useEffect(() => {
    if (!isConnected || !user?.id) {
      return;
    }

    const destination =
      user.role === "ADMIN"
        ? `/topic/tenants/${user.tenantId}/tasks`
        : `/topic/users/${user.id}/tasks`;

    return subscribe(destination, (message) => {
      const payload = parseMessage(message.body);
      void queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      if (payload.id) {
        void queryClient.invalidateQueries({
          queryKey: taskKeys.detail(String(payload.id)),
        });
      }
      if (payload.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.detail(payload.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: projectKeys.activity(payload.projectId),
          exact: true,
        });
      }
    });
  }, [isConnected, queryClient, subscribe, user?.id, user?.role, user?.tenantId]);

  React.useEffect(() => {
    if (!isConnected || !user?.id || !user.tenantId) {
      return;
    }

    const destination =
      user.role === "ADMIN"
        ? `/topic/tenants/${user.tenantId}/invoices`
        : `/topic/users/${user.id}/invoices`;

    return subscribe(destination, (message) => {
      const payload = parseMessage(message.body);
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      if (user.role === "ADMIN") {
        void queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
      }
      if (payload.id) {
        void queryClient.invalidateQueries({
          queryKey: invoiceKeys.detail(String(payload.id)),
        });
      }
      if (payload.projectId) {
        void queryClient.invalidateQueries({
          queryKey: projectKeys.invoices(payload.projectId),
        });
        void queryClient.invalidateQueries({
          queryKey: projectKeys.activity(payload.projectId),
          exact: true,
        });
      }
    });
  }, [isConnected, queryClient, subscribe, user?.id, user?.role, user?.tenantId]);

  return null;
}
