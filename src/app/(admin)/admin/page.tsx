"use client";

import * as React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import {
  Activity,
  AlertTriangle,
  Cpu,
  FolderOpen,
  Receipt,
  Server,
  Users,
  WalletCards,
} from "lucide-react";
import { DashboardSkeleton } from "@/components/skeletons/page-skeletons";
import { GaugeChart } from "@/features/admin/components/charts/gauge-chart";
import { useControlCenterQuery } from "@/features/admin/hooks/use-admin";
import type {
  AdminAlert,
  AdminEventItem,
  ControlCenterResponse,
  ControlCenterSummary,
} from "@/features/admin/types/admin.types";
import { cn, formatFiat } from "@/lib/utils";

const statusTone = {
  UP: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  DEGRADED: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  DOWN: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const severityTone = {
  INFO: "border-sky-500/25 bg-sky-500/10 text-sky-300",
  SUCCESS: "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
  WARNING: "border-amber-500/25 bg-amber-500/10 text-amber-300",
  CRITICAL: "border-rose-500/25 bg-rose-500/10 text-rose-300",
};

function StatusBadge({ status }: { status: "UP" | "DEGRADED" | "DOWN" }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest", statusTone[status])}>
      {status}
    </span>
  );
}

function SeverityBadge({ severity }: { severity: AdminAlert["severity"] | AdminEventItem["severity"] }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-widest", severityTone[severity])}>
      {severity}
    </span>
  );
}

function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-content-primary">{title}</h2>
      {action}
    </div>
  );
}

function MetricCard({
  label,
  value,
  helper,
  icon: Icon,
  status,
}: {
  label: string;
  value: string | number;
  helper: string;
  icon: React.ElementType;
  status?: ControlCenterSummary["systemStatus"];
}) {
  return (
    <div className="rounded-lg border border-theme-border bg-surface-elevated/70 p-4 shadow-lg shadow-black/10">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-[10px] font-bold uppercase tracking-widest text-content-muted">{label}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-content-primary">{value}</p>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-theme-border bg-surface-base text-theme-accent">
          <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-4 flex min-h-6 items-center justify-between gap-2">
        <p className="truncate text-xs text-content-muted">{helper}</p>
        {status ? <StatusBadge status={status} /> : null}
      </div>
    </div>
  );
}

function SystemVitalsPanel({ data }: { data: ControlCenterResponse }) {
  const uptimeHours = Math.floor(data.health.uptimeSeconds / 3600);
  const uptimeMinutes = Math.floor((data.health.uptimeSeconds % 3600) / 60);

  return (
    <section className="rounded-lg border border-theme-border bg-surface-elevated/70 p-5 shadow-lg shadow-black/10">
      <SectionHeader title="System Vitals" action={<StatusBadge status={data.health.overallStatus} />} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <GaugeChart label="JVM Memory" isFractional value={data.health.jvm.usedMemoryMb} max={data.health.jvm.maxMemoryMb} subLabel="Megabytes" />
        <GaugeChart label="Database" status={data.health.database.status} />
        <GaugeChart label="Redis" status={data.health.redis.status} />
        <GaugeChart label="AI Engine" status={data.health.aiEngine.status} />
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border border-theme-border bg-surface-base/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Processors</p>
          <p className="text-sm font-bold text-content-primary">{data.health.jvm.availableProcessors} cores</p>
        </div>
        <div className="flex items-center justify-between rounded-lg border border-theme-border bg-surface-base/50 p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Uptime</p>
          <p className="text-sm font-bold text-content-primary">{uptimeHours}h {uptimeMinutes}m</p>
        </div>
      </div>
    </section>
  );
}

function CompactSummaryCard({ title, description, href, actionLabel }: { title: string, description: string, href: string, actionLabel: string }) {
  return (
    <section className="rounded-lg border border-theme-border bg-surface-elevated/70 p-5 shadow-lg shadow-black/10 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-content-primary">{title}</h2>
        <p className="mt-1 text-xs text-content-muted">{description}</p>
      </div>
      <Link href={href} className="text-xs font-semibold text-theme-accent hover:text-theme-accent-hover">{actionLabel} &rarr;</Link>
    </section>
  );
}

function AlertsPanel({ alerts }: { alerts: AdminAlert[] }) {
  return (
    <section className="rounded-lg border border-theme-border bg-surface-elevated/70 p-5 shadow-lg shadow-black/10">
      <SectionHeader title="Operational Alerts" />
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-200">
            No active operational alerts.
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-lg border border-theme-border bg-surface-base/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-content-primary">{alert.title}</p>
                  <p className="mt-1 text-sm text-content-muted">{alert.message}</p>
                </div>
                <SeverityBadge severity={alert.severity} />
              </div>
              <div className="mt-3 flex gap-2 rounded-md bg-surface-elevated/70 p-3 text-xs text-content-secondary">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-300" aria-hidden="true" />
                <span>{alert.recommendedAction}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}



export default function AdminOverviewPage() {
  const { data, isLoading, isError } = useControlCenterQuery();

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return (
      <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 p-5 text-sm text-rose-200">
        Admin control center is unavailable.
      </div>
    );
  }

  const summary = data.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md border border-theme-border bg-surface-elevated px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-content-muted">
            <Server className="h-3.5 w-3.5 text-theme-accent" aria-hidden="true" />
            Admin Control Center
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-content-primary">Platform Operations</h1>
          <p className="mt-1 max-w-2xl text-sm text-content-muted">
            System health, domain activity, and security posture across the platform.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-theme-border bg-surface-elevated/70 px-3 py-2">
          <Activity className="h-4 w-4 text-theme-accent" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Checked</p>
            <p className="text-xs font-semibold text-content-primary">
              {formatDistanceToNow(new Date(data.health.checkedAt), { addSuffix: true })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Revenue" value={formatFiat(summary.totalRevenue)} helper="Paid invoices" icon={WalletCards} />
        <MetricCard label="Active Users" value={summary.activeUsers24h} helper="Last 24 hours" icon={Users} />
        <MetricCard label="Open Projects" value={summary.openProjects} helper="Not closed" icon={FolderOpen} />
        <MetricCard label="Unpaid Invoices" value={summary.unpaidInvoices} helper="Needs attention" icon={Receipt} />
        <MetricCard label="System Status" value={summary.systemStatus} helper="Overall platform state" icon={Cpu} status={summary.systemStatus} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SystemVitalsPanel data={data} />
        <div className="flex flex-col gap-5">
          <AlertsPanel alerts={data.alerts} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            <CompactSummaryCard title="Recent Domain Events" description="System and domain activities" href="/admin/events" actionLabel="Open Events" />
            <CompactSummaryCard title="Recent Audit Logs" description="Security and compliance evidence" href="/admin/logs" actionLabel="Open Audit" />
            <CompactSummaryCard title="Active Feature Flags" description="Feature toggles and configurations" href="/admin/flags" actionLabel="Open Flags" />
          </div>
        </div>
      </div>
    </div>
  );
}
