import { EscrowStatus, InvoiceStatus, PaymentMethod } from "@/lib/type";

export interface Invoice {
  id: string;
  title: string;
  description?: string;
  amount: string;
  dueDate: string;
  status: InvoiceStatus;
  paymentMethod: PaymentMethod;
  projectId: string;
  clientId: string;
  freelancerId: string;
  smartContractId?: string;
  txHash?: string;
  walletAddress?: string;
  escrowStatus?: EscrowStatus;
  confirmations?: number;
  paidAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceQueryParams {
  status?: InvoiceStatus;
  projectId?: string;
}

export interface CreateInvoicePayload {
  title: string;
  amount: string;
  dueDate: string;
  projectId: string;
  clientId?: string;
  paymentMethod: PaymentMethod;
  freelancerWalletAddress?: string;
  description?: string;
}
