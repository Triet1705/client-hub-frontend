import { apiClient } from "@/lib/axios";
import { InvoiceStatus } from "@/lib/type";
import type { Invoice, InvoiceQueryParams } from "../types/invoice.types";

const INVOICES_BASE = "/invoices";

export async function fetchInvoices(params: InvoiceQueryParams = {}): Promise<Invoice[]> {
  const { data } = await apiClient.get<Invoice[]>(INVOICES_BASE, {
    params: {
      status: params.status,
      projectId: params.projectId,
    },
  });

  return data;
}

export async function fetchInvoiceById(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`${INVOICES_BASE}/${id}`);
  return data;
}

export async function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`${INVOICES_BASE}/${id}/status`, null, {
    params: { status },
  });
  return data;
}
