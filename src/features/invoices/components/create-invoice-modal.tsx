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
import { useCurrentUserQuery } from "@/features/users/hooks/use-current-user";
import { useAccount } from "wagmi";
import { Wallet, Building2 } from "lucide-react";
import { isAddress } from "viem";
import { ApiClientError } from "@/lib/api/error";
import { formatFiat } from "@/lib/utils";

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
  const [fieldErrors, setFieldErrors] = React.useState<Record<string, string>>({});

  const { data: projectsData, isLoading: loadingProjects } = useProjectsQuery(0, 100);
  const { mutate: createInvoice, isPending } = useCreateInvoiceMutation();
  const { address, isConnected } = useAccount();
  const { data: currentUser } = useCurrentUserQuery();
  const { data: systemConfig } = useQuery({
    queryKey: ["system", "config"],
    queryFn: fetchSystemConfig,
    staleTime: 60_000,
  });
  const tomorrow = new Date();
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
      setFieldErrors({});
    }
  }, [isOpen, defaultProjectId]);

  const handleClose = () => {
    if (!isPending) onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    if (!title || !amount || !dueDate || !projectId) return;
    if (!/^[1-9]\d*$/.test(amount)) return;
    if (dueDate < tomorrow) {
      setFieldErrors({ dueDate: "Due date must be in the future." });
      return;
    }
    if (paymentMethod === PaymentMethod.CRYPTO_ESCROW && !isAddress(walletAddress)) return;
    if (
      paymentMethod === PaymentMethod.CRYPTO_ESCROW &&
      currentUser?.walletAddress &&
      walletAddress.toLowerCase() === currentUser.walletAddress.toLowerCase()
    ) {
      setFieldErrors({
        freelancerWalletAddress: "Freelancer wallet must be different from your bound client wallet.",
      });
      return;
    }

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
      {
        onSuccess: handleClose,
        onError: (err: unknown) => {
          const apiError = err as ApiClientError;
          if (apiError.status === 400 && Array.isArray(apiError.details)) {
            const newErrors: Record<string, string> = {};
            apiError.details.forEach((detail) => {
              if (typeof detail === "string") {
                const [field, ...msgParts] = detail.split(": ");
                if (field && msgParts.length > 0) {
                  newErrors[field] = msgParts.join(": ");
                }
              }
            });
            setFieldErrors(newErrors);
          } else if (
            apiError.status === 409 &&
            apiError.message.toLowerCase().includes("project budget")
          ) {
            setFieldErrors({ amount: apiError.message });
          }
        }
      },
    );
  };

  const projects = projectsData?.content || [];
  const selectedProject = projects.find((project) => project.id === projectId);
  const projectOptions: SelectOption[] = projects.map((p) => ({
    value: p.id,
    label: p.title,
  }));

  const amountIsValid = /^[1-9]\d*$/.test(amount);
  const dueDateIsValid = !!dueDate && dueDate >= tomorrow;
  const blockchainEnabled = systemConfig?.blockchainEnabled === true;
  const boundClientWalletIsValid = isAddress(currentUser?.walletAddress ?? "");
  const connectedWalletMatchesBoundClient =
    boundClientWalletIsValid &&
    !!address &&
    currentUser?.walletAddress?.toLowerCase() === address.toLowerCase();
  const freelancerWalletIsDistinct =
    !currentUser?.walletAddress ||
    walletAddress.toLowerCase() !== currentUser.walletAddress.toLowerCase();
  const walletIsValid =
    paymentMethod !== PaymentMethod.CRYPTO_ESCROW ||
    (isAddress(walletAddress) && freelancerWalletIsDistinct);
  const canUseCrypto =
    blockchainEnabled &&
    isConnected &&
    connectedWalletMatchesBoundClient;
  const cryptoRequirementMessage = !isConnected
    ? "Connect wallet first"
    : !boundClientWalletIsValid
      ? "Bind your client wallet in Settings"
      : !connectedWalletMatchesBoundClient
        ? "Connect your bound client wallet"
        : "USDC/USDT on Polygon";
  const canSubmit =
    !!title &&
    amountIsValid &&
    dueDateIsValid &&
    !!projectId &&
    walletIsValid &&
    (paymentMethod !== PaymentMethod.CRYPTO_ESCROW || canUseCrypto);

  // ── footer ──────────────────────────────────────────────────────────────
  const footer = (
    <>
      <Button
        variant="ghost"
        onClick={handleClose}
        disabled={isPending}
        className="px-6 text-content-secondary hover:text-content-primary"
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
          {fieldErrors.projectId && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.projectId}</p>}
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
          {fieldErrors.title && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.title}</p>}
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
          {fieldErrors.description && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.description}</p>}
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
              <p className="text-xs text-status-danger-text mt-2">Use whole-dollar amounts greater than zero.</p>
            ) : null}
            {fieldErrors.amount && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.amount}</p>}
            {selectedProject?.budget ? (
              <p className="mt-2 text-xs text-content-muted">
                Project budget: {formatFiat(selectedProject.budget)}. Existing non-refunded invoices also reserve this budget.
              </p>
            ) : null}
          </FormField>
          <FormField label="Due Date" required>
            <CustomDatePicker
              value={dueDate}
              onChange={(date) => {
                setDueDate(date);
                setFieldErrors((current) => {
                  const next = { ...current };
                  delete next.dueDate;
                  return next;
                });
              }}
              disabled={isPending}
              disabledDays={{ before: tomorrow }}
              isError={!!fieldErrors.dueDate}
            />
            {fieldErrors.dueDate && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.dueDate}</p>}
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
                  ? "bg-surface-elevated/80 border-theme-accent ring-1 ring-theme-accent"
                  : "bg-surface/40 border-theme-border/50 hover:bg-surface-elevated/50 hover:border-theme-border"
              }`}
            >
              <Building2 className={`w-5 h-5 mb-2 ${paymentMethod === PaymentMethod.FIAT ? "text-theme-accent" : "text-content-secondary"}`} />
              <span className={`text-sm font-medium ${paymentMethod === PaymentMethod.FIAT ? "text-content-primary" : "text-content-secondary"}`}>
                Bank Transfer
              </span>
              <span className="text-xs text-content-muted mt-1">Standard FIAT payment</span>
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
                    ? "bg-surface/20 border-theme-border opacity-40 cursor-not-allowed"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "bg-surface-elevated/80 border-theme-accent ring-1 ring-theme-accent"
                      : "bg-surface/40 border-theme-border/50 hover:bg-surface-elevated/50 hover:border-theme-border"
                }`}
              >
                <Wallet className={`w-5 h-5 mb-2 ${
                  !canUseCrypto
                    ? "text-content-muted"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "text-theme-accent"
                      : "text-content-secondary"
                }`} />
                <span className={`text-sm font-medium ${
                  !canUseCrypto
                    ? "text-content-muted"
                    : paymentMethod === PaymentMethod.CRYPTO_ESCROW
                      ? "text-content-primary"
                      : "text-content-secondary"
                }`}>
                  Crypto Escrow
                </span>
                <span className="text-xs text-content-muted mt-1">
                  {cryptoRequirementMessage}
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
              <p className="text-xs text-content-muted mt-2">
                This address will receive funds when the client releases the escrow.
              </p>
              {walletAddress && !isAddress(walletAddress) ? (
                <p className="text-xs text-status-danger-text mt-2">Enter a valid Ethereum wallet address.</p>
              ) : null}
              {walletAddress && isAddress(walletAddress) && !freelancerWalletIsDistinct ? (
                <p className="text-xs text-status-danger-text mt-2">
                  Freelancer wallet must be different from your bound client wallet.
                </p>
              ) : null}
              {fieldErrors.freelancerWalletAddress && <p className="text-xs text-status-danger-text mt-2">{fieldErrors.freelancerWalletAddress}</p>}
            </FormField>
          </div>
        )}

      </form>
    </ModalShell>
  );
}
