"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Cpu, HeartPulse } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";
import { GaugeChart } from "@/features/admin/components/charts/gauge-chart";
import { useSystemHealthQuery } from "@/features/admin/hooks/use-admin";
import type { ComponentHealth } from "@/features/admin/types/admin.types";
import { cn } from "@/lib/utils";

const statusTone = {
  UP: "border-theme-accent bg-action-subtle text-theme-accent",
  DEGRADED: "border-status-warning-border bg-status-warning-surface text-status-warning-text",
  DOWN: "border-status-danger-border bg-status-danger-surface text-status-danger-text",
};

function StatusBadge({ status }: { status: "UP" | "DEGRADED" | "DOWN" }) {
  return (
    <span className={cn("rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest", statusTone[status])}>
      {status}
    </span>
  );
}

function healthDetail(component: ComponentHealth) {
  const enabled = component.enabled ?? component.status !== "DISABLED";
  const latency = enabled && component.latencyMs !== null
    ? `${component.latencyMs}ms latency`
    : "Not checked";
  return `${component.label} · ${latency}`;
}

export default function AdminHealthPage() {
  const { data: health, isLoading, isError } = useSystemHealthQuery();

  if (isLoading && !health) {
    return <DashboardSkeleton />;
  }

  if (isError || !health) {
    return (
      <div className="rounded-lg border border-status-danger-border bg-status-danger-surface p-5 text-sm text-status-danger-text">
        System health is unavailable.
      </div>
    );
  }

  const uptimeHours = Math.floor(health.uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((health.uptimeSeconds % 3600) / 60);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-elevated px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
            <HeartPulse className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
            Health
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-content-primary">System Health</h1>
          <p className="mt-1 max-w-2xl text-sm text-content-muted">
            Live status for core platform dependencies and runtime vitals.
          </p>
        </div>
        <div className="rounded-lg border border-theme-border bg-surface-elevated/70 px-3 py-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Overall</p>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={health.overallStatus} />
            <span className="text-xs text-content-muted">
              checked {formatDistanceToNow(new Date(health.checkedAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GaugeChart label="Database" status={health.database.status} subLabel={healthDetail(health.database)} />
        <GaugeChart label="Redis" status={health.redis.status} subLabel={healthDetail(health.redis)} />
        <GaugeChart label="AI Engine" status={health.aiEngine.status} subLabel={healthDetail(health.aiEngine)} />
        <GaugeChart label="Blockchain" status={health.blockchain.status} subLabel={healthDetail(health.blockchain)} />
      </div>

      <section className="rounded-lg border border-theme-border bg-surface-elevated/70 p-5 shadow-lg shadow-black/10">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-theme-border bg-surface-base text-theme-accent">
            <Cpu className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base font-semibold text-content-primary">JVM Runtime</h2>
            <p className="text-sm text-content-muted">Memory, processors, and uptime for the backend process.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <GaugeChart label="JVM Memory" isFractional value={health.jvm.usedMemoryMb} max={health.jvm.maxMemoryMb} subLabel="Megabytes" />
          <div className="rounded-lg border border-theme-border bg-surface-base/50 p-4 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Available Processors</p>
            <p className="mt-2 text-2xl font-bold text-content-primary">{health.jvm.availableProcessors} cores</p>
          </div>
          <div className="rounded-lg border border-theme-border bg-surface-base/50 p-4 flex flex-col justify-center items-center text-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Uptime</p>
            <p className="mt-2 text-2xl font-bold text-content-primary">{uptimeHours}h {uptimeMinutes}m</p>
          </div>
        </div>
      </section>
    </div>
  );
}
