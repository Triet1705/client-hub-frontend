"use client";

import Link from "next/link";
import type { ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, BadgeCheck, Database, Flag, KeyRound, Shield, SlidersHorizontal, Users } from "lucide-react";
import { SummaryCard } from "@/components/ui/summary-card";
import { AdminSettingsSkeleton } from "@/components/skeletons/page-skeletons";
import { useCurrentUserQuery } from "@/features/users/hooks/use-current-user";
import { useSystemHealthQuery } from "@/features/admin/hooks/use-admin";
import type { ComponentHealth } from "@/features/admin/types/admin.types";
import { fetchSystemConfig } from "@/lib/api/config.api";
import { cn } from "@/lib/utils";

function HealthCard({ label, component }: { label: string; component: ComponentHealth | undefined }) {
  const status = component?.status ?? "CHECKING";
  const enabled = component
    ? (component.enabled ?? component.status !== "DISABLED")
    : false;
  const tone =
    status === "UP"
      ? "border-theme-accent bg-action-subtle text-theme-accent"
      : status === "DEGRADED"
        ? "border-status-warning-border bg-status-warning-surface text-status-warning-text"
        : status === "DISABLED"
          ? "border-content-muted/20 bg-status-neutral-surface text-content-secondary"
          : "border-status-danger-border bg-status-danger-surface text-status-danger-text";
  const latency = component && enabled && component.latencyMs !== null
    ? `${component.latencyMs}ms latency`
    : component
      ? "Not checked"
      : "Waiting for health response";

  return (
    <div className="rounded-3xl border border-theme-border bg-surface-base/50 p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-content-primary">{label}</p>
          <p className="mt-1 text-xs text-content-muted">{component?.label ?? "Checking"}</p>
        </div>
        <span className={cn("rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", tone)}>
          {status}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-elevated">
        <div className={cn(
          "h-full",
          status === "UP"
            ? "w-full bg-status-success-text"
            : status === "DEGRADED"
              ? "w-1/2 bg-status-warning-text"
              : status === "DISABLED"
                ? "w-0 bg-status-neutral-text"
                : "w-1/5 bg-status-danger-text",
        )} />
      </div>
      <p className="mt-3 font-mono text-xs text-content-muted">{latency}</p>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { data: me, isLoading: userLoading } = useCurrentUserQuery();
  const { data: health, isLoading: healthLoading } = useSystemHealthQuery();
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ["system", "config"],
    queryFn: fetchSystemConfig,
  });

  if (userLoading && healthLoading && configLoading) {
    return <AdminSettingsSkeleton />;
  }

  const shortcuts: Array<[string, string, ElementType]> = [
    ["Manage Users", "/admin/users", Users],
    ["Audit", "/admin/logs", BadgeCheck],
    ["Events", "/admin/events", Activity],
    ["Flags", "/admin/flags", Flag],
    ["Invoice Ops", "/admin/invoices", Activity],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-theme-accent bg-action-subtle px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-theme-accent">
            <Shield className="h-3.5 w-3.5" />
            Platform administrator
          </div>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-content-primary">Admin Settings</h1>
          <p className="mt-2 max-w-2xl text-content-muted">
            Review administrator account context, platform health, runtime summary, and shortcuts to operational tools.
          </p>
        </div>
        <div className="rounded-2xl bg-surface-elevated/70 px-4 py-3 ring-1 ring-theme-border">
          <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">Signed in as</p>
          <p className="mt-1 max-w-xs truncate text-sm font-semibold text-content-primary">{me?.email ?? "Unknown admin"}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <SummaryCard label="Admin Account" value={userLoading ? "..." : me?.role ?? "ADMIN"} icon={Shield} isLoading={userLoading} badge={{ label: "Protected", variant: "emerald" }} />
        <SummaryCard label="System Health" value={health?.overallStatus ?? "..."} icon={Activity} isLoading={healthLoading} badge={{ label: health?.overallStatus ?? "Checking", variant: health?.overallStatus === "UP" ? "emerald" : "amber" }} />
        <SummaryCard label="Blockchain" value={config?.blockchainEnabled ? "Enabled" : "Disabled"} icon={SlidersHorizontal} isLoading={configLoading} badge={{ label: "Read only", variant: "slate" }} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_0.85fr]">
        <section className="rounded-3xl border border-theme-border bg-surface-elevated/70 p-4 shadow-2xl shadow-theme sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="rounded-2xl bg-action-subtle p-2.5 text-theme-accent ring-1 ring-theme-accent">
              <Database className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Platform Health</h2>
              <p className="mt-1 text-sm text-content-muted">Live component status from the admin health endpoint.</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <HealthCard label="Database" component={health?.database} />
            <HealthCard label="Redis" component={health?.redis} />
            <HealthCard label="AI Engine" component={health?.aiEngine} />
          </div>
        </section>

        <section className="rounded-3xl border border-theme-border bg-surface-elevated/70 p-4 shadow-2xl shadow-theme sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="rounded-2xl bg-action-subtle p-2.5 text-theme-accent ring-1 ring-theme-accent">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Admin Account</h2>
              <p className="mt-1 text-sm text-content-muted">Security posture and role context.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-2xl border border-theme-border bg-surface-base/50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-content-muted">Email</p>
              <p className="mt-2 break-all text-sm font-semibold text-content-primary">{me?.email ?? "Unknown"}</p>
            </div>
            <div className="rounded-2xl border border-theme-border bg-surface-base/50 p-4">
              <p className="text-xs font-bold uppercase tracking-widest text-content-muted">Role</p>
              <p className="mt-2 text-sm font-semibold text-theme-accent">PLATFORM ADMIN</p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1fr]">
        <section className="rounded-3xl border border-theme-border bg-surface-elevated/70 p-4 shadow-2xl shadow-theme sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="rounded-2xl bg-action-subtle p-2.5 text-theme-accent ring-1 ring-theme-accent">
              <Flag className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Configuration Summary</h2>
              <p className="mt-1 text-sm text-content-muted">Small runtime snapshot. Full capability status lives in Flags.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-2xl border border-theme-border bg-surface-base/50 p-4">
              <span className="text-sm font-medium text-content-primary">Blockchain workflows</span>
              <span className={cn("rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest", config?.blockchainEnabled ? "bg-action-subtle text-theme-accent" : "bg-status-neutral-surface text-content-secondary")}>
                {config?.blockchainEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-theme-border bg-surface-base/50 p-4">
              <span className="text-sm font-medium text-content-primary">Admin console</span>
              <span className="rounded-full bg-action-subtle px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-theme-accent">Active</span>
            </div>
            <Link href="/admin/flags" className="flex items-center justify-between rounded-2xl border border-theme-border bg-surface-base/50 p-4 text-sm font-medium text-content-primary transition-colors hover:border-theme-accent hover:bg-action-subtle">
              <span>Open dedicated flags view</span>
              <Flag className="h-4 w-4 text-theme-accent" />
            </Link>
          </div>
        </section>

        <section className="rounded-3xl border border-theme-border bg-surface-elevated/70 p-4 shadow-2xl shadow-theme sm:p-6">
          <div className="mb-6 flex items-start gap-3">
            <span className="rounded-2xl bg-action-subtle p-2.5 text-theme-accent ring-1 ring-theme-accent">
              <Users className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-content-primary">Operational Shortcuts</h2>
              <p className="mt-1 text-sm text-content-muted">Jump to the admin work surfaces without duplicating tables here.</p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {shortcuts.map(([label, href, ShortcutIcon]) => {
              return (
                <Link key={href} href={href} className="rounded-2xl border border-theme-border bg-surface-base/50 p-4 text-content-primary transition-colors hover:border-theme-accent hover:bg-action-subtle">
                  <ShortcutIcon className="mb-4 h-5 w-5 text-theme-accent" />
                  <span className="text-sm font-semibold">{label}</span>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
