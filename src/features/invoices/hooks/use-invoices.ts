import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api/error";
import { InvoiceStatus } from "@/lib/type";
import { fetchInvoiceById, fetchInvoices, updateInvoiceStatus } from "../api/invoice.api";
import type { InvoiceQueryParams } from "../types/invoice.types";

export const invoiceKeys = {
  all: ["invoices"] as const,
  lists: () => [...invoiceKeys.all, "list"] as const,
  list: (params: InvoiceQueryParams) => [...invoiceKeys.all, "list", params] as const,
  details: () => [...invoiceKeys.all, "detail"] as const,
  detail: (id: string) => [...invoiceKeys.details(), id] as const,
};

export function useInvoicesQuery(params: InvoiceQueryParams) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => fetchInvoices(params),
    placeholderData: keepPreviousData,
  });
}

export function useInvoiceDetailQuery(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => fetchInvoiceById(id),
    enabled: Boolean(id),
  });
}

export function useUpdateInvoiceStatusMutation(currentParams: InvoiceQueryParams) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      updateInvoiceStatus(id, status),
    onSuccess: () => {
      toast.success("Invoice Updated", {
        description: "Invoice status changed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.list(currentParams) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
    },
    onError: (error: unknown) => {
      const message = getApiErrorMessage(error, "Failed to update invoice status.");
      toast.error("Update Failed", { description: message });
    },
  });
}
