"use client";

import * as React from "react";
import { ModalShell } from "@/components/ui/modal-shell";
import { PaymentMethod } from "@/lib/type";
import { useCreateInvoiceMutation } from "../hooks/use-invoices";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { fetchSystemConfig } from "@/lib/api/config.api";
import { useAccount } from "wagmi";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}

export function CreateInvoiceModal({ isOpen, onClose, defaultProjectId }: CreateInvoiceModalProps) {
  const [title, setTitle] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [projectId, setProjectId] = React.useState(defaultProjectId || "");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.FIAT);
  const [walletAddress, setWalletAddress] = React.useState("");
  const [isBlockchainEnabled, setIsBlockchainEnabled] = React.useState(false);

  const { data: projectsData, isLoading: loadingProjects } = useProjectsQuery(0, 100);
  const { mutate: createInvoice, isPending } = useCreateInvoiceMutation();
  const { address } = useAccount();

  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setAmount("");
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setDueDate(twoWeeksFromNow.toISOString().split("T")[0]);
      setProjectId(defaultProjectId || "");
      setPaymentMethod(PaymentMethod.FIAT);
      setWalletAddress(address || "");
      
      fetchSystemConfig().then((cfg) => {
        setIsBlockchainEnabled(cfg.blockchainEnabled);
      }).catch(() => setIsBlockchainEnabled(true));
    }
  }, [isOpen, address]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate || !projectId) return;

    createInvoice(
      {
        title,
        amount,
        dueDate: new Date(dueDate).toISOString(),
        projectId,
        paymentMethod,
        walletAddress: paymentMethod === PaymentMethod.CRYPTO_ESCROW ? walletAddress : undefined,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const projects = projectsData?.content || [];

  return (
    <ModalShell 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Create Invoice"
      footer={
        <div className="flex justify-end space-x-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-invoice-form"
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create Invoice"}
          </button>
        </div>
      }
    >
      <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-4 pt-4 pb-2">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
          <input
            required
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. Phase 1 Development"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Amount (USD)</label>
          <input
            required
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder="e.g. 1500.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
          <input
            required
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Project</label>
          <select
            required
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value="" disabled>
              {loadingProjects ? "Loading..." : "Select a project"}
            </option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1">Payment Method</label>
          <select
            required
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
          >
            <option value={PaymentMethod.FIAT}>FIAT (Bank Transfer)</option>
            {isBlockchainEnabled && (
              <option value={PaymentMethod.CRYPTO_ESCROW}>CRYPTO (USDC/USDT)</option>
            )}
          </select>
        </div>

        {paymentMethod === PaymentMethod.CRYPTO_ESCROW && (
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Freelancer Wallet Address</label>
            <input
              required
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="0x..."
            />
            <p className="text-xs text-slate-500 mt-1">This address will receive funds when the client releases the escrow.</p>
          </div>
        )}
      </form>
    </ModalShell>
  );
}
