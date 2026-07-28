"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";

import { invoiceKeys } from "@/features/invoices/hooks/use-invoices";
import { useRealtimeConnection } from "../context/realtime-provider";

export function useInvoiceRealtime(invoiceId: string) {
  const queryClient = useQueryClient();
  const { isConnected, subscribe } = useRealtimeConnection();

  React.useEffect(() => {
    if (!isConnected || !invoiceId) {
      return;
    }

    return subscribe(`/topic/invoices/${invoiceId}/status`, () => {
      void queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(invoiceId),
      });
      void queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      void queryClient.invalidateQueries({
        queryKey: invoiceKeys.auditProof(invoiceId),
      });
    });
  }, [invoiceId, isConnected, queryClient, subscribe]);
}
