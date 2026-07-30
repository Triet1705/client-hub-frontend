"use client";

import { AlertTriangle, CheckCircle2, Clock3, Database, Radio } from "lucide-react";
import { useAuditAnchorSummaryQuery } from "../hooks/use-admin";
import { cn } from "@/lib/utils";

export function AuditAnchorSummary() {
  const { data, isLoading, isError } = useAuditAnchorSummaryQuery();

  if (isLoading) return <div className="h-24 animate-pulse rounded-lg bg-surface/60" />;
  if (isError || !data) return <div className="rounded-lg border border-status-danger-border bg-status-danger-surface p-4 text-sm text-status-danger-text">Audit anchor summary is unavailable.</div>;

  const metrics = [
    { label: "Waiting records", value: data.waitingRecords, icon: Database, tone: "text-content-secondary" },
    { label: "Pending batches", value: data.pendingBatches, icon: Clock3, tone: "text-status-warning-text" },
    { label: "Confirmed batches", value: data.confirmedBatches, icon: CheckCircle2, tone: "text-theme-accent" },
    { label: "Failed batches", value: data.failedBatches, icon: AlertTriangle, tone: data.failedBatches ? "text-status-danger-text" : "text-content-secondary" },
  ];

  return (
    <section className="overflow-hidden rounded-lg border border-theme-border bg-surface/60">
      <div className="grid sm:grid-cols-2 xl:grid-cols-5">
        {metrics.map((metric) => (
          <div key={metric.label} className="border-b border-theme-border p-4 sm:border-r xl:border-b-0">
            <div className="flex items-center gap-2 text-xs text-content-muted">
              <metric.icon className={cn("h-4 w-4", metric.tone)} />
              {metric.label}
            </div>
            <p className="mt-2 text-2xl font-semibold text-content-primary">{metric.value.toLocaleString()}</p>
          </div>
        ))}
        <div className="p-4">
          <div className="flex items-center gap-2 text-xs text-content-muted"><Radio className="h-4 w-4" />Service</div>
          <p className={cn("mt-2 text-sm font-semibold", data.serviceStatus === "READY" ? "text-theme-accent" : "text-status-warning-text")}>{data.serviceStatus}</p>
          <p className="mt-1 text-[11px] text-content-muted">
            {data.latestConfirmedAt ? `Last anchor ${new Date(data.latestConfirmedAt).toLocaleString()}` : "No confirmed anchor yet"}
          </p>
        </div>
      </div>
    </section>
  );
}
