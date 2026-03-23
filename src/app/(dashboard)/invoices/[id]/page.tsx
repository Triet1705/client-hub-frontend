"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Copy, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { toast } from "sonner";
import { OperationsDetailLayout } from "@/components/layout/operations-detail-layout";
import { InvoiceStatusPill } from "@/features/invoices/components/invoice-status-pill";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  useInvoiceDetailQuery,
  useUpdateInvoiceStatusMutation,
} from "@/features/invoices/hooks/use-invoices";
import { canTransitionTo } from "@/lib/invoice-status-mapper";
import { InvoiceStatus } from "@/lib/type";

function formatUsd(value: string) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return value;
  return parsed.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return format(date, "MMM d, yyyy HH:mm");
}

function getTransitionOptions(current: InvoiceStatus): InvoiceStatus[] {
  const statuses = Object.values(InvoiceStatus);
  return statuses.filter((nextStatus) => canTransitionTo(current, nextStatus));
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

  const canUpdateStatus = user?.role === "CLIENT" || user?.role === "ADMIN";
  const isFreelancerView = user?.role === "FREELANCER";

  const transitionOptions = React.useMemo(
    () => (invoice ? getTransitionOptions(invoice.status) : []),
    [invoice],
  );

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
    return (
      <div className="space-y-6 max-w-350">
        <div className="h-8 w-72 rounded bg-slate-800/60 animate-pulse" />
        <div className="h-140 rounded-2xl border border-slate-800 bg-slate-900/30 animate-pulse" />
      </div>
    );
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
          {canUpdateStatus && transitionOptions.length > 0 ? (
            <select
              className="h-10 rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-slate-200 focus:border-emerald-500/50 focus:outline-none"
              defaultValue=""
              onChange={(event) => {
                const nextStatus = event.target.value as InvoiceStatus;
                if (!nextStatus) return;
                updateStatusMutation.mutate({ id: invoice.id, status: nextStatus });
                event.target.value = "";
              }}
              disabled={updateStatusMutation.isPending}
            >
              <option value="">Update status...</option>
              {transitionOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          ) : null}
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Internal Notes</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">
                  {isFreelancerView
                    ? "Freelancer view focuses on payment status, due date, and settlement references."
                    : "Client/Admin view includes status transition controls and settlement verification context."}
                </p>
              </div>
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
    </div>
  );
}
