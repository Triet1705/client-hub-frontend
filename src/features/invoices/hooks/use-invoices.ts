import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { InvoiceStatus } from "@/lib/type";
import { fetchInvoiceById, fetchInvoices, updateInvoiceStatus, createInvoice, fetchInvoiceAuditProof, verifyInvoiceAuditProof } from "../api/invoice.api";
import type { InvoiceQueryParams } from "../types/invoice.types";
import { projectKeys } from "@/features/projects/hooks/use-projects";
import { useRealtimeConnection } from "@/features/realtime/context/realtime-provider";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: InvoiceQueryParams) => [...invoiceKeys.all, "list", params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
  auditProof: (id: string) => [...invoiceKeys.detail(id), "audit-proof"] as const,
};

export function useInvoicesQuery(params: InvoiceQueryParams) {
  const { isConnected } = useRealtimeConnection();
  const query = useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => fetchInvoices(params),
    placeholderData: keepPreviousData,
    refetchInterval: isConnected ? false : 10_000,
  });

  return query;
}

export function useInvoiceDetailQuery(id: string) {
  const { isConnected } = useRealtimeConnection();
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoiceById(id),
    enabled: Boolean(id),
    refetchInterval: isConnected ? false : 10_000,
  });
}

export function useInvoiceAuditProofQuery(id: string) {
  return useQuery({
    queryKey: invoiceKeys.auditProof(id),
    queryFn: () => fetchInvoiceAuditProof(id),
    enabled: Boolean(id),
  });
}

export function useVerifyInvoiceAuditProofMutation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => verifyInvoiceAuditProof(id),
    onSuccess: (proof) => queryClient.setQueryData(invoiceKeys.auditProof(id), proof),
  });
}

export function useUpdateInvoiceStatusMutation(currentParams: InvoiceQueryParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: (_, variables) => {
      toast.success("Invoice Updated", {
        description: "Invoice status changed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.list(currentParams) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.auditProof(variables.id) });
      if (currentParams.projectId) {
        queryClient.invalidateQueries({
          queryKey: projectKeys.activity(currentParams.projectId),
          exact: true,
        });
      }
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Failed to update invoice status.");
      toast.error("Update Failed", { description: message });
    },
  });
}

export function useCreateInvoiceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: import("../types/invoice.types").CreateInvoicePayload) => createInvoice(payload),
    onSuccess: (_, variables) => {
      toast.success("Invoice Created", {
        description: "New invoice has been created.",
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["admin", "invoices"] });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({
        queryKey: projectKeys.activity(variables.projectId),
        exact: true,
      });
      queryClient.invalidateQueries({ queryKey: projectKeys.invoices(variables.projectId) });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Failed to create invoice.");
      toast.error("Invoice not created", { description: message });
    },
  });
}
