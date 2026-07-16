import { apiClient } from "@/lib/axios";
import { InvoiceStatus } from "@/lib/type";
import type { Invoice, InvoiceQueryParams } from "../types/invoice.types";
import type { UserAuditProof } from "@/features/audit/types/audit-proof.types";

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

export async function createInvoice(payload: import("../types/invoice.types").CreateInvoicePayload): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>(INVOICES_BASE, payload);
  return data;
}

export async function fetchInvoiceAuditProof(id: string): Promise<UserAuditProof> {
  const { data } = await apiClient.get<UserAuditProof>(`${INVOICES_BASE}/${id}/audit-proof`);
  return data;
}

export async function verifyInvoiceAuditProof(id: string): Promise<UserAuditProof> {
  const { data } = await apiClient.post<UserAuditProof>(`${INVOICES_BASE}/${id}/audit-proof/verify`);
  return data;
}
