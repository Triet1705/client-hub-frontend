"use client";

import * as React from "react";
import { Database, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuditAnchorBatchesQuery, useRunAuditAnchoringMutation } from "../hooks/use-admin";
import { Pagination } from "@/components/ui/pagination";
import type { AuditAnchorBatch } from "../types/admin.types";

const STATUS_STYLE: Record<string, string> = {
  CONFIRMED: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  SUBMITTED: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  READY: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  BUILDING: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  FAILED: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

export function AuditAnchorBatches() {
  const [page, setPage] = React.useState(0);
  const [status, setStatus] = React.useState<AuditAnchorBatch["status"] | undefined>();
  const { data, isLoading, isError } = useAuditAnchorBatchesQuery({ page, size: 20, status });
  const runMutation = useRunAuditAnchoringMutation();

  React.useEffect(() => setPage(0), [status]);

  return (
    <section className="space-y-3" aria-labelledby="anchor-batches-heading">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 id="anchor-batches-heading" className="flex items-center gap-2 text-sm font-semibold text-content-primary">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            Blockchain proof batches
          </h3>
          <p className="mt-1 text-xs text-content-muted">Recent Merkle roots submitted by the audit anchoring service.</p>
        </div>
        <Button size="sm" onClick={() => runMutation.mutate()} isLoading={runMutation.isPending}>
          Anchor now
        </Button>
      </div>

      {runMutation.isError && <p className="text-xs text-rose-300">Anchoring could not be started. Check blockchain readiness.</p>}
      {runMutation.isSuccess && !runMutation.data && <p className="text-xs text-content-muted">No unanchored audit records are waiting.</p>}

      <div className="flex flex-wrap gap-2" aria-label="Batch status filter">
        {([undefined, "READY", "SUBMITTED", "CONFIRMED", "FAILED"] as const).map((value) => (
          <button
            key={value ?? "ALL"}
            type="button"
            onClick={() => setStatus(value)}
            className={cn(
              "h-8 rounded-md border px-3 text-xs font-semibold transition-colors",
              status === value
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-theme-border bg-surface-elevated text-content-muted hover:text-content-primary",
            )}
          >
            {value ?? "ALL"}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-theme-border bg-surface-elevated">
        {isLoading ? (
          <div className="h-20 animate-pulse bg-surface-sunken" />
        ) : isError ? (
          <div className="px-4 py-5 text-sm text-rose-300">Batch history is temporarily unavailable.</div>
        ) : !data?.content.length ? (
          <div className="flex items-center gap-3 px-4 py-5 text-sm text-content-muted">
            <Database className="h-4 w-4" /> No audit roots have been created yet.
          </div>
        ) : (
          <div className="divide-y divide-theme-border">
            {data.content.map((batch) => (
              <div key={batch.id} className="grid gap-3 px-4 py-3 md:grid-cols-[7rem_1fr_7rem_8rem] md:items-center">
                <span className={cn("w-fit rounded border px-2 py-1 text-[10px] font-semibold", STATUS_STYLE[batch.status])}>
                  {batch.status}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-mono text-xs text-content-secondary" title={batch.merkleRoot}>{batch.merkleRoot}</p>
                  {batch.lastError && <p className="mt-1 truncate text-xs text-rose-300">{batch.lastError}</p>}
                </div>
                <span className="text-xs text-content-muted">{batch.recordCount} records</span>
                <span className="text-xs text-content-muted">{batch.confirmations} confirmations</span>
              </div>
            ))}
          </div>
        )}
        {data ? (
          <Pagination
            page={page}
            totalPages={data.totalPages}
            totalElements={data.totalElements}
            onPageChange={setPage}
            label="batches"
          />
        ) : null}
      </div>
    </section>
  );
}
