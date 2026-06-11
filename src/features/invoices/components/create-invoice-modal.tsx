"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { ModalShell } from "@/components/ui/modal-shell";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/ui/custom-date-picker";
import { Button } from "@/components/ui/button";
import { PaymentMethod } from "@/lib/type";
import { fetchSystemConfig } from "@/lib/api/config.api";
import { useCreateInvoiceMutation } from "../hooks/use-invoices";
import { useProjectsQuery } from "@/features/projects/hooks/use-projects";
import { useAccount } from "wagmi";
import { Wallet, Building2 } from "lucide-react";
import { isAddress } from "viem";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultProjectId?: string;
}


export function CreateInvoiceModal({ isOpen, onClose, defaultProjectId }: CreateInvoiceModalProps) {
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueDate, setDueDate] = React.useState<Date | undefined>(undefined);
  const [projectId, setProjectId] = React.useState(defaultProjectId || "");
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>(PaymentMethod.FIAT);
  const [walletAddress, setWalletAddress] = React.useState("");

  const { data: projectsData, isLoading: loadingProjects } = useProjectsQuery(0, 100);
  const { mutate: createInvoice, isPending } = useCreateInvoiceMutation();
  const { isConnected } = useAccount();
  const { data: systemConfig } = useQuery({
    queryKey: ["system", "config"],
    queryFn: fetchSystemConfig,
    staleTime: 60_000,
  });

  React.useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setAmount("");
      // Default to 14 days from now
      const twoWeeksFromNow = new Date();
      twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
      setDueDate(twoWeeksFromNow);
      setProjectId(defaultProjectId || "");
      setPaymentMethod(PaymentMethod.FIAT);
      setWalletAddress("");
    }
  }, [isOpen, defaultProjectId]);

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !dueDate || !projectId) return;
    if (!/^[1-9]\d*$/.test(amount)) return;
    if (paymentMethod === PaymentMethod.CRYPTO_ESCROW && !isAddress(walletAddress)) return;

    createInvoice(
      {
        title,
        description: description.trim() || undefined,
        amount,
        dueDate: `${dueDate!.getFullYear()}-${String(dueDate!.getMonth() + 1).padStart(2, "0")}-${String(dueDate!.getDate()).padStart(2, "0")}`,
        projectId,
        paymentMethod,
        freelancerWalletAddress: paymentMethod === PaymentMethod.CRYPTO_ESCROW ? walletAddress : undefined,
      },
      { onSuccess: handleClose },
    );
  };

  const projects = projectsData?.content || [];
  const projectOptions: SelectOption[] = projects.map((p) => ({
    value: p.id,
    label: p.title,
  }));

  const amountIsValid = /^[1-9]\d*$/.test(amount);
  const walletIsValid = paymentMethod !== PaymentMethod.CRYPTO_ESCROW || isAddress(walletAddress);
  const blockchainEnabled = systemConfig?.blockchainEnabled === true;
  const canUseCrypto = blockchainEnabled && isConnected;
  const canSubmit = !!title && amountIsValid && !!dueDate && !!projectId && walletIsValid;

  // ── footer ──────────────────────────────────────────────────────────────
  const footer = (
    <>
      <Button
        variant="ghost"
        onClick={handleClose}
        disabled={isPending}
        className="px-6 text-slate-400 hover:text-white"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        form="create-invoice-form"
        isLoading={isPending}
        disabled={!canSubmit}
        className="px-6 font-bold"
      >
        {isPending ? "Creating…" : "Create Invoice"}
      </Button>
    </>
  );

  // ── render ──────────────────────────────────────────────────────────────
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleClose}
      isPending={isPending}
      title="Create Invoice"
      footer={footer}
    >
      <form id="create-invoice-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Project */}
        <FormField label="Project" required>
          <SelectDropdown
            options={projectOptions}
            value={projectId}
            onChange={setProjectId}
            placeholder="— Select a project —"
            loading={loadingProjects}
          />
        </FormField>

        {/* Title */}
        <FormField label="Invoice Title" required>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Phase 1 Development"
            disabled={isPending}
          />
        </FormField>

        {/* Description */}
        <FormField label="Internal Notes / Description">
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional notes for this invoice"
            disabled={isPending}
          />
        </FormField>

        {/* Amount + Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Amount (USD)" required>
            <Input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
              placeholder="1500"
              className="font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              disabled={isPending}
            />
            {amount && !amountIsValid ? (
              <p className="text-xs text-rose-400 mt-2">Use whole-dollar amounts greater than zero.</p>
            ) : null}
          </FormField>
          <FormField label="Due Date" required>
            <CustomDatePicker
              value={dueDate}
              onChange={setDueDate}
              disabled={isPending}
            />
          </FormField>
        </div>

        {/* Payment Method */}
        <FormField label="Payment Method">
          <div className="grid grid-cols-2 gap-3">
            {/* FIAT card */}
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.FIAT)}
              className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                paymentMethod === PaymentMethod.FIAT
                  ? "bg-slate-800/80 border-emerald-500 ring-1 ring-emerald-500/20"
                  : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
              }`}
            >
              <Building2 className={`w-5 h-5 mb-2 ${paymentMethod === PaymentMethod.FIAT ? "text-emerald-400" : "text-slate-400"}`} />
              <span className={`text-sm font-medium ${paymentMethod === PaymentMethod.FIAT ? "text-slate-100" : "text-slate-300"}`}>
                Bank Transfer
              </span>
              <span className="text-xs text-slate-500 mt-1">Standard FIAT payment</span>
            </button>

            {blockchainEnabled ? (
              <button
                type="button"
                disabled={!canUseCrypto}
                onClick={() => {
                  if (canUseCrypto) {
                    setPaymentMethod(PaymentMethod.CRYPTO_ESCROW);
                  }
                }}
                className={`flex flex-col items-start p-4 rounded-xl border transition-all ${
                  !canUseCrypto
                    ? "bg-slate-900/20 border-slate-800 opacity-40 cursor-not-allowed"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "bg-slate-800/80 border-emerald-500 ring-1 ring-emerald-500/20"
                      : "bg-slate-900/40 border-slate-700/50 hover:bg-slate-800/50 hover:border-slate-600"
                }`}
              >
                <Wallet className={`w-5 h-5 mb-2 ${
                  !canUseCrypto
                    ? "text-slate-600"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "text-emerald-400"
                      : "text-slate-400"
                }`} />
                <span className={`text-sm font-medium ${
                  !canUseCrypto
                    ? "text-slate-600"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "text-slate-100"
                      : "text-slate-300"
                }`}>
                  Crypto Escrow
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {canUseCrypto ? "USDC/USDT on Polygon" : "Connect wallet first"}
                </span>
              </button>
            ) : null}
          </div>
        </FormField>

        {/* Wallet address when crypto selected */}
        {paymentMethod === PaymentMethod.CRYPTO_ESCROW && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <FormField label="Freelancer Wallet Address">
              <Input
                type="text"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                placeholder="0x..."
                disabled={isPending}
              />
              <p className="text-xs text-slate-500 mt-2">
                This address will receive funds when the client releases the escrow.
              </p>
              {walletAddress && !isAddress(walletAddress) ? (
                <p className="text-xs text-rose-400 mt-2">Enter a valid Ethereum wallet address.</p>
              ) : null}
            </FormField>
          </div>
        )}

      </form>
    </ModalShell>
  );
}
