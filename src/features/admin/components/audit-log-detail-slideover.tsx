import * as React from "react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import type { AdminAuditLogResponse } from "../types/admin.types";
import { CloseIcon, AuditLoggingIcon } from "@/components/icons";
import { RoleBadge } from "./role-badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Clock3, Unplug } from "lucide-react";
import { useAuditProofQuery, useVerifyAuditProofMutation } from "../hooks/use-admin";
import type { AuditVerificationStatus } from "../types/admin.types";

interface SlideoverProps {
  log: AdminAuditLogResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailSlideover({ log, isOpen, onClose }: SlideoverProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  const { data: storedProof, isLoading: isProofLoading, isError: isProofError } =
    useAuditProofQuery(log?.id ?? 0, isOpen && !!log);
  const verifyMutation = useVerifyAuditProofMutation();
  const proof = verifyMutation.data?.auditLogId === log?.id ? verifyMutation.data : storedProof;

  React.useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !isMounted || !log) return null;

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-40 animate-in bg-[var(--overlay)] backdrop-blur-sm fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-elevated shadow-2xl z-50 flex flex-col border-l border-theme-border animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-theme-border bg-surface-sunken/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-theme-accent/10 flex items-center justify-center text-theme-accent">
              <AuditLoggingIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-content-primary tracking-wide">Audit Log Detail</h2>
              <p className="text-xs text-content-muted">Event #{log.id} • {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors"
          >
            <CloseIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">

          {/* Action Header */}
          <div className="flex flex-col items-center justify-center p-6 bg-surface-sunken rounded-xl border border-theme-border">
            <span className="text-sm font-medium text-content-muted uppercase tracking-widest mb-1">Action</span>
            <span className="text-2xl font-bold text-content-primary mb-3">{log.action.replace(/_/g, " ")}</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-surface-base text-content-secondary uppercase">
                {log.entityType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-action-subtle text-theme-accent uppercase ring-1 ring-inset ring-theme-accent">
                {log.isAnchored ? "Anchored" : "Pending Anchor"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Actor Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Actor</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-content-muted mb-1">User Email</p>
                  <p className="text-sm text-content-primary font-medium">{log.userEmail || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">User ID</p>
                  <p className="text-xs text-content-secondary font-mono break-all">{log.userId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Role</p>
                  <div className="inline-block mt-0.5">
                    <RoleBadge role={log.userRole || "N/A"} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Tenant ID</p>
                  <p className="text-xs text-content-secondary font-mono">{log.tenantId || "SYSTEM"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">IP Address</p>
                  <p className="text-xs text-content-secondary font-mono">{log.ipAddress || "—"}</p>
                </div>
              </div>
            </div>

            {/* Target Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Target</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-content-muted mb-1">Entity Type</p>
                  <p className="text-sm text-content-primary font-medium uppercase">{log.entityType}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Entity ID</p>
                  <p className="text-xs text-content-secondary font-mono break-all">{log.entityId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Data Hash</p>
                  <div className="bg-surface-sunken p-2 rounded border border-theme-border break-all text-[10px] font-mono text-content-muted">
                    {log.dataHash || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme-border pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-content-muted">Blockchain Proof</h4>
              <Button
                size="sm"
                variant="outline"
                disabled={!proof?.batchId}
                isLoading={verifyMutation.isPending}
                onClick={() => log && verifyMutation.mutate(log.id)}
              >
                Verify proof
              </Button>
            </div>

            {isProofLoading ? (
              <div className="h-20 animate-pulse rounded-lg bg-surface-sunken" />
            ) : isProofError ? (
              <p className="rounded-lg border border-status-danger-border bg-status-danger-surface p-3 text-sm text-status-danger-text">
                Proof details are temporarily unavailable.
              </p>
            ) : proof ? (
              <div className="space-y-3 rounded-lg border border-theme-border bg-surface-sunken p-4">
                <ProofStatus status={proof.verificationStatus} />
                {proof.batchId && (
                  <div className="grid gap-3 text-xs md:grid-cols-2">
                    <ProofValue label="Batch" value={proof.batchId} />
                    <ProofValue label="Batch state" value={proof.batchStatus || "Pending"} />
                    <ProofValue label="Chain ID" value={proof.chainId?.toString() || "Pending submission"} />
                    <ProofValue label="Confirmations" value={proof.confirmations.toString()} />
                    <ProofValue label="Merkle root" value={proof.merkleRoot || "Pending"} wide />
                    <ProofValue label="Leaf hash" value={proof.leafHash || "Pending"} wide />
                    <ProofValue label="Transaction" value={proof.transactionHash || "Pending submission"} wide />
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Data Changes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Data Changes</h4>

            {(log.oldValue || log.newValue) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.oldValue && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-status-danger-text">Previous State</p>
                    <pre className="bg-surface-sunken border border-theme-border rounded-lg p-4 text-[11px] font-mono text-content-secondary overflow-x-auto whitespace-pre-wrap">
                      {log.oldValue}
                    </pre>
                  </div>
                )}

                {log.newValue && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-theme-accent">New State</p>
                    <pre className="bg-surface-sunken border border-theme-border rounded-lg p-4 text-[11px] font-mono text-content-secondary overflow-x-auto whitespace-pre-wrap">
                      {log.newValue}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-surface-sunken rounded-xl border border-theme-border text-content-muted text-sm">
                No payload changes recorded for this event.
              </div>
            )}
          </div>

        </div>
      </div>
    </>,
    document.body
  );
}

function ProofStatus({ status }: { status: AuditVerificationStatus }) {
  const config = {
    VERIFIED: { icon: ShieldCheck, label: "Verified against the on-chain root", className: "text-theme-accent" },
    PENDING: { icon: Clock3, label: "Proof created; blockchain confirmation is pending", className: "text-status-warning-text" },
    NOT_ANCHORED: { icon: Clock3, label: "This record is waiting for an anchor batch", className: "text-content-muted" },
    TAMPERED: { icon: ShieldAlert, label: "Verification failed: stored content or proof does not match", className: "text-status-danger-text" },
    CHAIN_UNAVAILABLE: { icon: Unplug, label: "The blockchain is unavailable; local proof remains stored", className: "text-status-info-text" },
  }[status];
  const Icon = config.icon;
  return <div className={`flex items-center gap-2 text-sm font-medium ${config.className}`}><Icon className="h-4 w-4" />{config.label}</div>;
}

function ProofValue({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={wide ? "md:col-span-2" : undefined}>
      <p className="mb-1 text-content-muted">{label}</p>
      <p className="break-all font-mono text-content-secondary">{value}</p>
    </div>
  );
}
