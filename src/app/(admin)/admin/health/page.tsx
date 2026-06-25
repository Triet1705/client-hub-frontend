"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Cpu, HeartPulse } from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";
import { GaugeChart } from "@/features/admin/components/charts/gauge-chart";
import { useSystemHealthQuery } from "@/features/admin/hooks/use-admin";
import { cn } from "@/lib/utils";

const statusTone = {
  UP: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  DEGRADED: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  DOWN: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

function StatusBadge({ status }: { status: "UP" | "DEGRADED" | "DOWN" }) {
  return (
    <span className={cn("rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest", statusTone[status])}>
      {status}
    </span>
  );
}



export default function AdminHealthPage() {
  const { data: health, isLoading, isError } = useSystemHealthQuery();

  if (isLoading && !health) {
    return <DashboardSkeleton />;
  }

  if (isError || !health) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
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
        <GaugeChart label="Database" status={health.database.status} subLabel={`${health.database.latencyMs}ms latency`} />
        <GaugeChart label="Redis" status={health.redis.status} subLabel={`${health.redis.latencyMs}ms latency`} />
        <GaugeChart label="AI Engine" status={health.aiEngine.status} subLabel={`${health.aiEngine.latencyMs}ms latency`} />
        <GaugeChart label="Blockchain" status={health.blockchain.status} subLabel={`${health.blockchain.latencyMs}ms latency`} />
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
