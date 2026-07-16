"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, ExternalLink, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditVerificationStatus, UserAuditProof } from "../types/audit-proof.types";

const STATUS_COPY: Record<AuditVerificationStatus, { label: string; description: string; style: string; icon: typeof ShieldCheck }> = {
  VERIFIED: {
    label: "Verified on blockchain",
    description: "This audit record matches the Merkle root stored on-chain.",
    style: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Blockchain confirmation pending",
    description: "The audit record is assigned to an anchor batch that is still processing.",
    style: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: Clock3,
  },
  NOT_ANCHORED: {
    label: "No audit proof available",
    description: "This record has not been included in a blockchain anchor batch yet.",
    style: "border-slate-700 bg-slate-800/60 text-slate-300",
    icon: ShieldCheck,
  },
  TAMPERED: {
    label: "Integrity check failed",
    description: "The stored audit data does not match its anchored proof.",
    style: "border-rose-500/30 bg-rose-500/10 text-rose-300",
    icon: AlertTriangle,
  },
  CHAIN_UNAVAILABLE: {
    label: "Blockchain unavailable",
    description: "The local proof is present, but the on-chain root cannot be read right now.",
    style: "border-sky-500/30 bg-sky-500/10 text-sky-300",
    icon: WifiOff,
  },
};

function explorerUrl(chainId: number | null, hash: string | null) {
  if (!hash || chainId !== 80002) return null;
  return `https://amoy.polygonscan.com/tx/${hash}`;
}

function EvidenceRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-white/5 py-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <div className="min-w-0 break-all font-mono text-xs text-slate-300">{value || "-"}</div>
    </div>
  );
}

export function IntegrityProofPanel({
  proof,
  isLoading = false,
  isError = false,
  onVerify,
  isVerifying = false,
  compact = false,
}: {
  proof?: UserAuditProof;
  isLoading?: boolean;
  isError?: boolean;
  onVerify?: () => void;
  isVerifying?: boolean;
  compact?: boolean;
}) {
  const [expanded, setExpanded] = React.useState(false);

  if (isLoading) return <div className="h-20 animate-pulse rounded-lg bg-slate-800/70" />;
  if (isError) return <p className="text-sm text-rose-300">Audit proof could not be loaded.</p>;

  const status = proof?.verificationStatus ?? "NOT_ANCHORED";
  const copy = STATUS_COPY[status];
  const Icon = copy.icon;
  const transactionUrl = explorerUrl(proof?.chainId ?? null, proof?.transactionHash ?? null);

  return (
    <div className={cn("rounded-lg border", copy.style)}>
      <div className={cn("flex flex-wrap items-start justify-between gap-3", compact ? "p-3" : "p-4")}>
        <div className="flex min-w-0 items-start gap-3">
          <Icon className="mt-0.5 h-4 w-4 shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold">{copy.label}</p>
            <p className="mt-1 text-xs text-slate-400">{copy.description}</p>
            {proof?.anchoredAt ? <p className="mt-2 text-[11px] text-slate-500">Anchored {new Date(proof.anchoredAt).toLocaleString()}</p> : null}
          </div>
        </div>
        {onVerify && proof?.proofAvailable ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-white/10 bg-slate-950/40 px-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-900 disabled:opacity-50"
          >
            <RefreshCw className={cn("h-3.5 w-3.5", isVerifying && "animate-spin")} />
            Verify
          </button>
        ) : null}
      </div>

      {proof?.proofAvailable ? (
        <>
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="flex w-full items-center justify-between border-t border-white/10 px-4 py-2 text-left text-xs font-semibold text-slate-300 hover:bg-slate-950/20"
          >
            Technical evidence
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
          {expanded ? (
            <div className="border-t border-white/10 bg-slate-950/30 px-4 py-2">
              <EvidenceRow label="Network" value={proof.chainId ? `Chain ${proof.chainId}` : null} />
              <EvidenceRow label="Confirmations" value={proof.confirmations} />
              <EvidenceRow label="Anchor transaction" value={transactionUrl ? <a href={transactionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-emerald-300 hover:text-emerald-200">{proof.transactionHash}<ExternalLink className="h-3 w-3 shrink-0" /></a> : proof.transactionHash} />
              <EvidenceRow label="Contract" value={proof.contractAddress} />
              <EvidenceRow label="Merkle root" value={proof.merkleRoot} />
              <EvidenceRow label="Leaf hash" value={proof.leafHash} />
              <EvidenceRow label="Hash format" value={proof.hashVersion} />
              <EvidenceRow label="Proof nodes" value={proof.proof?.length ? proof.proof.map((node, index) => <span key={`${node}-${index}`} className="block">{index + 1}. {node}</span>) : "Single-record tree"} />
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
