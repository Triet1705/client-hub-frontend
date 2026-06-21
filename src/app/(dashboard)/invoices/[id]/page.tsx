"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Copy, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { OperationsDetailLayout } from "@/components/layout/operations-detail-layout";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { INVOICE_STATUS_LABELS } from "@/features/invoices/constants/invoice.constants";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useInvoiceDetailQuery,
  useUpdateInvoiceStatusMutation,
} from "@/features/invoices/hooks/use-invoices";
import { canTransitionTo } from "@/lib/invoice-status-mapper";
import { InvoiceStatus, PaymentMethod } from "@/lib/type";
import {
  ESCROW_ADDRESS,
  ESCROW_TOKEN_ADDRESS,
  ESCROW_TOKEN_DECIMALS,
  isConfiguredAddress,
  useEscrowContract,
} from "@/features/wallet/hooks/useEscrowContract";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount, useChainId } from "wagmi";
import { InvoiceDetailSkeleton } from "@/components/skeletons/page-skeletons";

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

  const { user } = useAuthStore();
  const { data: invoice, isLoading, isError } = useInvoiceDetailQuery(invoiceId);
  const updateStatusMutation = useUpdateInvoiceStatusMutation({
    status: undefined,
    projectId: invoice?.projectId,
  });

  const { isConnected } = useAccount();
  const chainId = useChainId();
  const {
    approve,
    isApproving,
    isApproveSuccess,
    approveError,
    deposit,
    isDepositing,
    isDepositSuccess,
    depositError,
    release,
    isReleasing,
    isReleaseSuccess,
    releaseError,
  } = useEscrowContract();

  React.useEffect(() => {
    if (isDepositSuccess) toast.success("Transaction submitted! 🚀", { description: "Deposit has been confirmed on-chain." });
    if (depositError) toast.error("Deposit Failed", { description: depositError.message });
  }, [isDepositSuccess, depositError]);

  React.useEffect(() => {
    if (isApproveSuccess) toast.success("Token approval confirmed", { description: "You can now secure this invoice in escrow." });
    if (approveError) toast.error("Approval Failed", { description: approveError.message });
  }, [isApproveSuccess, approveError]);

  React.useEffect(() => {
    if (isReleaseSuccess) toast.success("Funds Released! 🚀", { description: "Escrow funds have been successfully released." });
    if (releaseError) toast.error("Release Failed", { description: releaseError.message });
  }, [isReleaseSuccess, releaseError]);

  const canUpdateStatus = user?.role === "CLIENT" || user?.role === "ADMIN";
  const _isFreelancerView = user?.role === "FREELANCER";
  const escrowContractConfigured = isConfiguredAddress(ESCROW_ADDRESS);
  const escrowTokenConfigured = isConfiguredAddress(ESCROW_TOKEN_ADDRESS);
  const freelancerWalletConfigured = isConfiguredAddress(invoice?.walletAddress);
  const expectedChainIds = [31337, 80002];
  const isSupportedChain = expectedChainIds.includes(chainId);
  const escrowConfigReady = escrowContractConfigured && escrowTokenConfigured && freelancerWalletConfigured && isSupportedChain;
  const escrowConfigMessage = !escrowContractConfigured
    ? "Escrow contract address is not configured."
    : !escrowTokenConfigured
      ? "Escrow token address is not configured."
      : !freelancerWalletConfigured
        ? "Freelancer wallet address is missing or invalid."
        : !isSupportedChain
          ? "Switch to Hardhat Local or Polygon Amoy."
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
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-300">
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
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Invoices
          </Link>

          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-white">{invoice.title}</h1>
            <InvoiceStatusPill status={invoice.status} />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
            <span className="font-mono">#{invoice.id}</span>
            <span>{formatDateTime(invoice.dueDate)}</span>
            <span>{invoice.paymentMethod}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold font-mono text-white">{formatUsd(invoice.amount)}</span>
        </div>
      </div>

      <OperationsDetailLayout
        main={(
          <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Invoice Overview</h2>
              <p className="text-xs text-slate-500 mt-1">Role-aware details for review and settlement</p>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Amount</p>
                  <p className="mt-2 text-lg font-bold text-white font-mono">{formatUsd(invoice.amount)}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Due Date</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">{formatDateTime(invoice.dueDate)}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Escrow</p>
                  <p className="mt-2 text-sm font-semibold text-slate-200">{invoice.escrowStatus ?? "-"}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Status History</h3>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Created</span>
                    <span className="font-mono text-slate-500">{formatDateTime(invoice.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Last Updated</span>
                    <span className="font-mono text-slate-500">{formatDateTime(invoice.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">Current Status</span>
                    <span className="font-semibold text-emerald-300">{invoice.status}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Internal Notes / Description</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {invoice.description ? invoice.description : "-"}
                </p>
              </div>

              {/* Action Bar */}
              {canUpdateStatus && (
                <div className="pt-4 border-t border-slate-800">
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
                                  <div className="rounded-xl bg-slate-900/50 p-4 border border-slate-800">
                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Escrow Process</h4>
                                    <div className="space-y-2 text-xs text-slate-400">
                                      <p className="flex items-center justify-between"><span className={!isApproveSuccess ? "text-emerald-400 font-bold" : ""}>1. Approve Token</span> <span>Gas fee only</span></p>
                                      <p className="flex items-center justify-between"><span className={isApproveSuccess ? "text-emerald-400 font-bold" : ""}>2. Secure Deposit</span> <span>Gas fee + Invoice Amount</span></p>
                                      <p className="flex items-center justify-between"><span>3. Release Payment</span> <span>Gas fee only</span></p>
                                    </div>
                                  </div>
                                  <div className="flex w-full gap-3">
                                    {!escrowConfigReady ? (
                                      <div className="rounded-xl bg-slate-900/50 p-4 text-center border border-slate-800 w-full">
                                        <p className="text-sm text-slate-400">{escrowConfigMessage}</p>
                                      </div>
                                    ) : !isApproveSuccess ? (
                                      <button
                                        type="button"
                                        disabled={isApproving}
                                        onClick={async () => { 
                                          try { 
                                            await approve(ESCROW_TOKEN_ADDRESS, invoice.amount, ESCROW_TOKEN_DECIMALS); 
                                          } catch (err) { 
                                            const e = err as Error & { name?: string };
                                            if (e?.message?.includes("User rejected") || e?.name === "UserRejectedRequestError") {
                                              toast.error("Transaction cancelled by user");
                                            } else {
                                              toast.error("Approval failed", { description: err instanceof Error ? err.message : "Unknown error" }); 
                                            }
                                          } 
                                        }}
                                        className="flex-1 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-cyan-900/20 hover:shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                          } catch (err) { 
                                            const e = err as Error & { name?: string };
                                            if (e?.message?.includes("User rejected") || e?.name === "UserRejectedRequestError") {
                                              toast.error("Transaction cancelled by user");
                                            } else {
                                              toast.error("Deposit failed", { description: err instanceof Error ? err.message : "Unknown error" }); 
                                            }
                                          } 
                                        }}
                                        className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {isDepositing ? "Processing..." : "Secure with Escrow"}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ) : invoice.status === InvoiceStatus.LOCKED ? (
                                <button
                                  type="button"
                                  disabled={isReleasing || !escrowContractConfigured || !isSupportedChain}
                                  onClick={async () => {
                                    try {
                                      await release(Number(invoice.id));
                                    } catch (err) {
                                      const e = err as Error & { name?: string };
                                      if (e?.message?.includes("User rejected") || e?.name === "UserRejectedRequestError") {
                                        toast.error("Transaction cancelled by user");
                                      }
                                    }
                                  }}
                                  className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isReleasing ? "Processing..." : "Release Payment"}
                                </button>
                              ) : (
                                <div className="rounded-xl bg-slate-900/50 p-4 text-center border border-slate-800 w-full">
                                  <p className="text-sm text-slate-400">Escrow operations are handled automatically or terminal for this status.</p>
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
                                className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 text-sm font-bold transition-all shadow-lg shadow-emerald-900/20 hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                Mark as {INVOICE_STATUS_LABELS[actualPrimary]}
                              </button>
                              {secondary.map((opt) => (
                                <button
                                  key={opt}
                                  type="button"
                                  disabled={updateStatusMutation.isPending}
                                  onClick={() => setConfirmStatus(opt)}
                                  className="flex-1 sm:flex-none rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 hover:text-white text-slate-300 px-5 py-3 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                    <div className="rounded-xl bg-slate-900/50 p-4 text-center border border-slate-800">
                      <p className="text-sm text-slate-400">This invoice has reached a terminal state. No further actions can be taken.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}
        sidebar={(
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Receipt size={14} />
                  Project Context
                </h3>
              </div>
              <div className="p-4 space-y-3 text-sm">
                <p className="text-slate-300">Project ID</p>
                <Link href={`/projects/${invoice.projectId}`} className="font-mono text-emerald-400 hover:text-emerald-300">
                  {invoice.projectId}
                </Link>
                <Link
                  href={`/invoices?projectId=${invoice.projectId}`}
                  className="inline-flex text-xs font-bold text-slate-400 hover:text-white"
                >
                  Open Project Invoices
                </Link>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <Wallet size={14} />
                  Payment Reference
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider">Wallet</p>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2">
                    <span className="font-mono text-slate-300 truncate">{invoice.walletAddress || "-"}</span>
                    {invoice.walletAddress ? (
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Wallet address", invoice.walletAddress)}
                        className="text-slate-500 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider">Transaction Hash</p>
                  <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-800 bg-slate-900/50 p-2">
                    <span className="font-mono text-slate-300 truncate">{invoice.txHash || "-"}</span>
                    {invoice.txHash ? (
                      <button
                        type="button"
                        onClick={() => copyToClipboard("Transaction hash", invoice.txHash)}
                        className="text-slate-500 hover:text-white"
                      >
                        <Copy size={14} />
                      </button>
                    ) : null}
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500 uppercase tracking-wider">Smart Contract</p>
                  <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-2 font-mono text-slate-300 truncate">
                    {invoice.smartContractId || "-"}
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-[#0f172a]/40 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-800">
                <h3 className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <ShieldCheck size={14} />
                  Audit
                </h3>
              </div>
              <div className="p-4 space-y-2 text-xs text-slate-400">
                <p>Created at: <span className="font-mono text-slate-300">{formatDateTime(invoice.createdAt)}</span></p>
                <p>Updated at: <span className="font-mono text-slate-300">{formatDateTime(invoice.updatedAt)}</span></p>
                <p>Method: <span className="font-semibold text-slate-300">{invoice.paymentMethod}</span></p>
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
            Change invoice status from <strong className="text-white">{INVOICE_STATUS_LABELS[invoice.status]}</strong> to{" "}
            <strong className="text-white">{confirmStatus && INVOICE_STATUS_LABELS[confirmStatus]}</strong>?
            <br />
            <span className="text-slate-400 mt-2 block">
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
