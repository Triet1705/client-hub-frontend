"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Copy, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { OperationsDetailLayout } from "@/components/layout/operations-detail-layout";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { INVOICE_STATUS_LABELS } from "@/features/invoices/constants/invoice.constants";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { useCurrentUserQuery } from "@/features/users/hooks/use-current-user";
import {
  invoiceKeys,
  useInvoiceDetailQuery,
  useInvoiceAuditProofQuery,
  useUpdateInvoiceStatusMutation,
  useVerifyInvoiceAuditProofMutation,
} from "@/features/invoices/hooks/use-invoices";
import { canTransitionTo } from "@/lib/invoice-status-mapper";
import { InvoiceStatus, PaymentMethod } from "@/lib/type";
import {
  ESCROW_ADDRESS,
  ESCROW_TOKEN_ADDRESS,
  ESCROW_TOKEN_DECIMALS,
  isConfiguredAddress,
  useEscrowContract,
  useTokenAllowance,
} from "@/features/wallet/hooks/useEscrowContract";
import { getWeb3ErrorMessage } from "@/features/wallet/lib/web3-error";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { InvoiceDetailSkeleton } from "@/components/skeletons/page-skeletons";
import { IntegrityProofPanel } from "@/features/audit/components/integrity-proof-panel";
import { useInvoiceRealtime } from "@/features/realtime/hooks/use-invoice-realtime";

function formatUsd(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "dd/MM/yyyy HH:mm");
}

function getTransitionOptions(current: InvoiceStatus): InvoiceStatus[] {
  const statuses = Object.values(InvoiceStatus);
  return statuses.filter((nextStatus) => canTransitionTo(current, nextStatus));
}

function getPrimaryTransition(status: InvoiceStatus): InvoiceStatus | null {
  switch (status) {
    case InvoiceStatus.DRAFT: return InvoiceStatus.SENT;
    case InvoiceStatus.SENT: return InvoiceStatus.PAID;
    case InvoiceStatus.OVERDUE: return InvoiceStatus.PAID;
    case InvoiceStatus.LOCKED: return InvoiceStatus.PAID;
    case InvoiceStatus.DISPUTED: return InvoiceStatus.PAID;
    default: return null;
  }
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const invoiceId = Array.isArray(params?.id) ? params.id[0] : params?.id ?? "";
  useInvoiceRealtime(invoiceId);

  const { user } = useAuthStore();
  const { data: currentUser } = useCurrentUserQuery();
  const queryClient = useQueryClient();
  const { data: invoice, isLoading, isError } = useInvoiceDetailQuery(invoiceId);
  const auditProofQuery = useInvoiceAuditProofQuery(invoiceId);
  const verifyAuditProofMutation = useVerifyInvoiceAuditProofMutation(invoiceId);
  const updateStatusMutation = useUpdateInvoiceStatusMutation({
    status: undefined,
    projectId: invoice?.projectId,
  });

  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    approve,
    isApproving,
    isApproveSuccess,
    deposit,
    isDepositing,
    isDepositSuccess,
    release,
    isReleasing,
    isReleaseSuccess,
  } = useEscrowContract(currentUser?.walletAddress);

  const expectedChainIds = [31337, 80002];
  const isSupportedChain = expectedChainIds.includes(chainId);

  const {
    hasAllowance,
    refetchAllowance,
    allowanceError,
  } = useTokenAllowance(address, invoice?.amount || 0, isSupportedChain, ESCROW_TOKEN_DECIMALS);

  const refetchInvoice = React.useCallback(() => {
    if (!invoiceId) return;
    void queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(invoiceId) });
    void queryClient.invalidateQueries({ queryKey: invoiceKeys.lists() });
  }, [invoiceId, queryClient]);

  React.useEffect(() => {
    if (isDepositSuccess) {
      toast.success("Transaction submitted! 🚀", { description: "Deposit has been confirmed on-chain. Waiting for backend sync..." });
      refetchInvoice();
    }
  }, [isDepositSuccess, refetchInvoice]);

  React.useEffect(() => {
    if (isApproveSuccess) {
      toast.success("Token approval confirmed", { description: "You can now secure this invoice in escrow." });
      void refetchAllowance();
    }
  }, [isApproveSuccess, refetchAllowance]);

  React.useEffect(() => {
    if (isReleaseSuccess) {
      toast.success("Funds Released! 🚀", { description: "Escrow funds have been successfully released. Waiting for backend sync..." });
      refetchInvoice();
    }
  }, [isReleaseSuccess, refetchInvoice]);

  const canUpdateStatus = user?.role === "CLIENT" || user?.role === "ADMIN";
  const _isFreelancerView = user?.role === "FREELANCER";
  const escrowContractConfigured = isConfiguredAddress(ESCROW_ADDRESS);
  const escrowTokenConfigured = isConfiguredAddress(ESCROW_TOKEN_ADDRESS);
  const freelancerWalletConfigured = isConfiguredAddress(invoice?.walletAddress);
  const clientWalletConfigured = isConfiguredAddress(currentUser?.walletAddress);
  const connectedWalletMatchesClient =
    clientWalletConfigured &&
    !!address &&
    currentUser?.walletAddress?.toLowerCase() === address.toLowerCase();
  const escrowConfigReady =
    escrowContractConfigured &&
    escrowTokenConfigured &&
    freelancerWalletConfigured &&
    clientWalletConfigured &&
    connectedWalletMatchesClient &&
    isSupportedChain &&
    !allowanceError;
  const escrowConfigMessage = !escrowContractConfigured
    ? "Escrow contract address is not configured."
    : !escrowTokenConfigured
      ? "Escrow token address is not configured."
      : !freelancerWalletConfigured
        ? "Freelancer wallet address is missing or invalid."
        : !clientWalletConfigured
          ? "Bind your client wallet in Settings before using escrow."
          : !connectedWalletMatchesClient
            ? "Connect the same wallet that is bound to your Client Hub profile."
        : !isSupportedChain
          ? "Switch to Hardhat Local or Polygon Amoy."
          : allowanceError
            ? "Local contracts are unavailable or out of sync. Run npm run local:bootstrap, then restart the apps."
          : null;

  const transitionOptions = React.useMemo(
    () => (invoice ? getTransitionOptions(invoice.status) : []),
    [invoice],
  );

  const [confirmStatus, setConfirmStatus] = React.useState<InvoiceStatus | null>(null);

  const copyToClipboard = async (label: string, value?: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Unable to copy value");
    }
  };

  if (isLoading) {
    return <InvoiceDetailSkeleton />;
  }

  if (isError || !invoice) {
    return (
      <div className="space-y-6 max-w-350">
        <div className="rounded-2xl border border-status-danger-border bg-status-danger-surface p-6 text-status-danger-text">
          Invoice not found or you do not have access.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-350">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <Link
            href="/invoices"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-muted hover:text-content-secondary transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Invoices
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-content-primary">{invoice.title}</h1>
            <InvoiceStatusPill status={invoice.status} />
          </div>

          <div className="flex items-center gap-4 text-xs text-content-secondary flex-wrap">
            <span className="font-mono">#{invoice.id}</span>
            <span>{formatDateTime(invoice.dueDate)}</span>
            <span>{invoice.paymentMethod}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold font-mono text-content-primary">{formatUsd(invoice.amount)}</span>
        </div>
      </div>

      <OperationsDetailLayout
        main={(
          <section className="rounded-2xl border border-theme-border bg-surface/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-theme-border">
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-secondary">Invoice Overview</h2>
              <p className="text-xs text-content-muted mt-1">Role-aware details for review and settlement</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-theme-border bg-surface/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-content-muted font-bold">Amount</p>
                  <p className="mt-2 text-lg font-bold text-content-primary font-mono">{formatUsd(invoice.amount)}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-content-muted font-bold">Due Date</p>
                  <p className="mt-2 text-sm font-semibold text-content-secondary">{formatDateTime(invoice.dueDate)}</p>
                </div>
                <div className="rounded-xl border border-theme-border bg-surface/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-content-muted font-bold">Escrow</p>
                  <p className="mt-2 text-sm font-semibold text-content-secondary">{invoice.escrowStatus ?? "-"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-theme-border bg-surface/50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-content-secondary">Status History</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-content-secondary">Created</span>
                    <span className="font-mono text-content-muted">{formatDateTime(invoice.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-content-secondary">Last Updated</span>
                    <span className="font-mono text-content-muted">{formatDateTime(invoice.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-content-secondary">Current Status</span>
                    <span className="font-semibold text-theme-accent">{invoice.status}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-theme-border bg-surface/50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-content-secondary">Internal Notes / Description</h3>
                <p className="mt-3 text-sm leading-relaxed text-content-secondary whitespace-pre-wrap">
                  {invoice.description ? invoice.description : "-"}
                </p>
              </div>

              {/* Action Bar */}
              {canUpdateStatus && (
                <div className="pt-4 border-t border-theme-border">
                  {transitionOptions.length > 0 ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {invoice.paymentMethod === PaymentMethod.CRYPTO_ESCROW ? (
                        <>
                          {(!isConnected) ? (
                            <ConnectButton />
                          ) : (
                            <>
                              {invoice.status === InvoiceStatus.DRAFT || invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.CRYPTO_ESCROW_WAITING ? (
                                <div className="flex flex-col w-full gap-4">
                                  <div className="rounded-xl bg-surface/50 p-4 border border-theme-border">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-content-secondary mb-2">Escrow Process</h4>
                                    <div className="space-y-2 text-xs text-content-secondary">
                                      <p className="flex items-center justify-between"><span className={!hasAllowance ? "text-theme-accent font-bold" : ""}>1. Approve {invoice.amount} mUSDT</span> <span>Gas fee only</span></p>
                                      <p className="flex items-center justify-between"><span className={hasAllowance ? "text-theme-accent font-bold" : ""}>2. Deposit {invoice.amount} mUSDT</span> <span>Gas fee only</span></p>
                                      <p className="flex items-center justify-between"><span>3. Release Payment</span> <span>Gas fee only</span></p>
                                      <p className="pt-2 text-[11px] text-content-muted">Wallets may display 0 ETH because this transfers ERC-20 tokens, not native ETH.</p>
                                    </div>
                                  </div>
                                  <div className="flex w-full gap-3">
                                    {!escrowConfigReady ? (
                                      <div className="rounded-xl bg-surface/50 p-4 text-center border border-theme-border w-full">
                                        <p className="text-sm text-content-secondary">{escrowConfigMessage}</p>
                                      </div>
                                    ) : !hasAllowance ? (
                                      <button
                                        type="button"
                                        disabled={isApproving}
                                        onClick={async () => {
                                          try {
                                            await approve(ESCROW_TOKEN_ADDRESS, invoice.amount, ESCROW_TOKEN_DECIMALS);
                                          } catch (err) {
                                            toast.error("Approval failed", { description: getWeb3ErrorMessage(err) });
                                          }
                                        }}
                                        className="flex-1 rounded-xl bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isApproving ? "Approving..." : "Approve Escrow Token"}
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={isDepositing}
                                        onClick={async () => {
                                          try {
                                            await deposit(Number(invoice.id), ESCROW_TOKEN_ADDRESS, invoice.amount, invoice.walletAddress!, ESCROW_TOKEN_DECIMALS);
                                            toast.success("Escrow funded", {
                                              description: `Client mUSDT -${invoice.amount}; escrow +${invoice.amount}. ETH is used only for gas.`,
                                            });
                                          } catch (err) {
                                            toast.error("Deposit failed", { description: getWeb3ErrorMessage(err) });
                                          }
                                        }}
                                        className="flex-1 rounded-xl bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isDepositing ? "Processing..." : "Secure with Escrow"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : invoice.status === InvoiceStatus.LOCKED ? (
                                <button
                                  type="button"
                                  disabled={isReleasing || !escrowConfigReady}
                                  onClick={async () => {
                                    try {
                                      await release(
                                        Number(invoice.id),
                                        ESCROW_TOKEN_ADDRESS,
                                        invoice.amount,
                                        invoice.walletAddress!,
                                        ESCROW_TOKEN_DECIMALS,
                                      );
                                      toast.success("Payment released", {
                                        description: `Freelancer mUSDT +${invoice.amount}; escrow -${invoice.amount}. ETH is used only for gas.`,
                                      });
                                    } catch (err) {
                                      toast.error("Release failed", { description: getWeb3ErrorMessage(err) });
                                    }
                                  }}
                                  className="flex-1 rounded-xl bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isReleasing ? "Processing..." : "Release Payment"}
                                </button>
                              ) : (
                                <div className="rounded-xl bg-surface/50 p-4 text-center border border-theme-border w-full">
                                  <p className="text-sm text-content-secondary">Escrow operations are handled automatically or terminal for this status.</p>
                                </div>
                              )}
                            </>
                          )}
                        </>
                      ) : (
                        (() => {
                          const primary = getPrimaryTransition(invoice.status);
                          const actualPrimary = primary && transitionOptions.includes(primary) ? primary : transitionOptions[0];
                          const secondary = transitionOptions.filter((t) => t !== actualPrimary);

                          return (
                            <>
                              <button
                                type="button"
                                disabled={updateStatusMutation.isPending}
                                onClick={() => setConfirmStatus(actualPrimary)}
                                className="flex-1 rounded-xl bg-action-primary hover:bg-action-primary-hover text-action-primary-foreground px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Mark as {INVOICE_STATUS_LABELS[actualPrimary]}
                              </button>
                              {secondary.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() => setConfirmStatus(opt)}
                                  className="flex-1 sm:flex-none rounded-xl border border-theme-border bg-surface-elevated/50 hover:bg-surface-elevated hover:border-theme-border hover:text-content-primary text-content-secondary px-5 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Mark as {INVOICE_STATUS_LABELS[opt]}
                                </button>
                              ))}
                            </>
                          );
                        })()
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl bg-surface/50 p-4 text-center border border-theme-border">
                      <p className="text-sm text-content-secondary">This invoice has reached a terminal state. No further actions can be taken.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
        sidebar={(
          <aside className="space-y-4">
            <section className="rounded-2xl border border-theme-border bg-surface/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-secondary">
                  <Receipt size={14} />
                  Project Context
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <p className="text-content-secondary">Project ID</p>
                <Link href={`/projects/${invoice.projectId}`} className="font-mono text-theme-accent hover:text-theme-accent">
                  {invoice.projectId}
                </Link>
                <Link
                  href={`/invoices?projectId=${invoice.projectId}`}
                  className="inline-flex text-xs font-bold text-content-secondary hover:text-content-primary"
                >
                  Open Project Invoices
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-theme-border bg-surface/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-secondary">
                  <Wallet size={14} />
                  Payment Reference
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <p className="text-content-muted uppercase tracking-wider">Wallet</p>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-theme-border bg-surface/50 p-2">
                    <span className="font-mono text-content-secondary truncate">{invoice.walletAddress || "-"}</span>
                    {invoice.walletAddress ? (
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Wallet address", invoice.walletAddress)}
                        className="text-content-muted hover:text-content-primary"
                      >
                        <Copy size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-content-muted uppercase tracking-wider">Payment / Escrow Transaction</p>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-theme-border bg-surface/50 p-2">
                    <span className="font-mono text-content-secondary truncate">{invoice.txHash || "-"}</span>
                    {invoice.txHash ? (
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Transaction hash", invoice.txHash)}
                        className="text-content-muted hover:text-content-primary"
                      >
                        <Copy size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-content-muted uppercase tracking-wider">Smart Contract</p>
                  <div className="rounded-lg border border-theme-border bg-surface/50 p-2 font-mono text-content-secondary truncate">
                    {invoice.smartContractId || "-"}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-theme-border bg-surface/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-theme-border">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-content-secondary">
                  <ShieldCheck size={14} />
                  Audit & Integrity
                </h3>
              </div>
              <div className="p-4 space-y-2 text-xs text-content-secondary">
                <p>Created at: <span className="font-mono text-content-secondary">{formatDateTime(invoice.createdAt)}</span></p>
                <p>Updated at: <span className="font-mono text-content-secondary">{formatDateTime(invoice.updatedAt)}</span></p>
                <p>Method: <span className="font-semibold text-content-secondary">{invoice.paymentMethod}</span></p>
                <div className="pt-2">
                  <IntegrityProofPanel
                    compact
                    proof={auditProofQuery.data}
                    isLoading={auditProofQuery.isLoading}
                    isError={auditProofQuery.isError}
                    onVerify={() => verifyAuditProofMutation.mutate()}
                    isVerifying={verifyAuditProofMutation.isPending}
                  />
                </div>
              </div>
            </section>
          </aside>
        )}
      />

      <ConfirmDialog
        isOpen={confirmStatus !== null}
        title="Confirm Status Change"
        message={
          <>
            Change invoice status from <strong className="text-content-primary">{INVOICE_STATUS_LABELS[invoice.status]}</strong> to{" "}
            <strong className="text-content-primary">{confirmStatus && INVOICE_STATUS_LABELS[confirmStatus]}</strong>?
            <br />
            <span className="text-content-secondary mt-2 block">
              Depending on the status, this action may notify the other party and cannot be easily undone for terminal states.
            </span>
          </>
        }
        confirmText={updateStatusMutation.isPending ? "Updating..." : "Confirm Change"}
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmStatus) {
            updateStatusMutation.mutate({ id: invoice.id, status: confirmStatus });
          }
          setConfirmStatus(null);
        }}
        onCancel={() => setConfirmStatus(null)}
        isLoading={updateStatusMutation.isPending}
      />
    </div>
  );
}
