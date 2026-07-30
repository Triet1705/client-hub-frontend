"use client";

import * as React from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, Clock3, ExternalLink, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuditVerificationStatus, UserAuditProof } from "../types/audit-proof.types";

const STATUS_COPY: Record<AuditVerificationStatus, { label: string; description: string; style: string; icon: typeof ShieldCheck }> = {
  VERIFIED: {
    label: "Verified on blockchain",
    description: "This audit record matches the Merkle root stored on-chain.",
    style: "border-theme-accent bg-action-subtle text-theme-accent",
    icon: CheckCircle2,
  },
  PENDING: {
    label: "Blockchain confirmation pending",
    description: "The audit record is assigned to an anchor batch that is still processing.",
    style: "border-status-warning-border bg-status-warning-surface text-status-warning-text",
    icon: Clock3,
  },
  NOT_ANCHORED: {
    label: "No audit proof available",
    description: "This record has not been included in a blockchain anchor batch yet.",
    style: "border-theme-border bg-surface-elevated/60 text-content-secondary",
    icon: ShieldCheck,
  },
  TAMPERED: {
    label: "Integrity check failed",
    description: "The stored audit data does not match its anchored proof.",
    style: "border-status-danger-border bg-status-danger-surface text-status-danger-text",
    icon: AlertTriangle,
  },
  CHAIN_UNAVAILABLE: {
    label: "Blockchain unavailable",
    description: "The local proof is present, but the on-chain root cannot be read right now.",
    style: "border-status-info-border bg-status-info-surface text-status-info-text",
    icon: WifiOff,
  },
};

function explorerUrl(chainId: number | null, hash: string | null) {
  if (!hash || chainId !== 80002) return null;
  return `https://amoy.polygonscan.com/tx/${hash}`;
}

function EvidenceRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid gap-1 border-t border-theme-border py-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">{label}</span>
      <div className="min-w-0 break-all font-mono text-xs text-content-secondary">{value || "-"}</div>
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

  if (isLoading) return <div className="h-20 animate-pulse rounded-lg bg-surface-elevated/70" />;
  if (isError) return <p className="text-sm text-status-danger-text">Audit proof could not be loaded.</p>;

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
            <p className="mt-1 text-xs text-content-secondary">{copy.description}</p>
            {proof?.anchoredAt ? <p className="mt-2 text-[11px] text-content-muted">Anchored {new Date(proof.anchoredAt).toLocaleString()}</p> : null}
          </div>
        </div>
        {onVerify && proof?.proofAvailable ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={isVerifying}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-theme-border bg-surface-base/40 px-3 text-xs font-semibold text-content-secondary transition hover:bg-surface disabled:opacity-50"
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
            className="flex w-full items-center justify-between border-t border-theme-border px-4 py-2 text-left text-xs font-semibold text-content-secondary hover:bg-surface-base/20"
          >
            Technical evidence
            <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
          </button>
          {expanded ? (
            <div className="border-t border-theme-border bg-surface-base/30 px-4 py-2">
              <EvidenceRow label="Network" value={proof.chainId ? `Chain ${proof.chainId}` : null} />
              <EvidenceRow label="Confirmations" value={proof.confirmations} />
              <EvidenceRow label="Anchor transaction" value={transactionUrl ? <a href={transactionUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-theme-accent hover:text-theme-accent">{proof.transactionHash}<ExternalLink className="h-3 w-3 shrink-0" /></a> : proof.transactionHash} />
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
