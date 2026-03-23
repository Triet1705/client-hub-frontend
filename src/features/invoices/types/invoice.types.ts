import { EscrowStatus, InvoiceStatus, PaymentMethod } from "@/lib/type";

export interface Invoice {
  id: string;
  title: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceQueryParams {
  status?: InvoiceStatus;
  projectId?: string;
}
