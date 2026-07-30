import * as React from "react";
import { cn } from "@/lib/utils";
import type { PlatformStats } from "../types/admin.types";
import { NavUsersIcon, NavProjectsIcon, NavInvoicesIcon, WalletIcon } from "@/components/icons";

interface PlatformStatsCardsProps {
  stats?: PlatformStats;
  isLoading: boolean;
}

export function PlatformStatsCards({ stats, isLoading }: PlatformStatsCardsProps) {
  const compactCards = [
    {
      label: "TOTAL USERS",
      value: stats?.totalUsers || 0,
      icon: <NavUsersIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />,
      colorClass: "text-theme-accent",
      borderClass: "hover:border-theme-accent",
    },
    {
      label: "TOTAL PROJECTS",
      value: stats?.totalProjects || 0,
      icon: <NavProjectsIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />,
      colorClass: "text-status-info-text",
      borderClass: "hover:border-status-info-border",
    },
    {
      label: "TOTAL INVOICES",
      value: stats?.totalInvoices || 0,
      icon: <NavInvoicesIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />,
      colorClass: "text-status-warning-text",
      borderClass: "hover:border-status-warning-border",
    },
  ];

  const revenueValue = `$${(Number(stats?.totalRevenue || 0) / 1000000).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Hero Card - Total Revenue (col-span-4) */}
      <div className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-theme p-6 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_var(--shadow-color)] group hover:border-theme-accent flex flex-col justify-between min-h-[160px]">
        {/* Glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-action-subtle rounded-full blur-[3rem] opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {isLoading ? (
          <div className="flex h-full flex-col justify-between space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-surface-elevated" />
            </div>
            <div className="space-y-2">
              <div className="h-10 w-32 animate-pulse rounded bg-surface-elevated" />
              <div className="h-4 w-48 animate-pulse rounded bg-surface-elevated" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <p className="text-sm font-bold tracking-widest text-content-secondary uppercase">TOTAL REVENUE (M)</p>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated border border-theme-border/50 shadow-inner group-hover:bg-surface-elevated/80 transition-colors text-theme-accent">
                <WalletIcon className="h-6 w-6" primaryColor="currentColor" accentColor="currentColor" />
              </div>
            </div>
            <div className="relative z-10">
              <h3 className="text-5xl lg:text-6xl font-bold text-content-primary tracking-tight font-space-grotesk">{revenueValue}</h3>
              <p className="text-content-muted mt-2 text-sm">Platform-wide processed volume</p>
            </div>
          </>
        )}
      </div>

      {/* Compact Cards Wrapper (col-span-8) */}
      <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        {compactCards.map((card, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden rounded-3xl bg-surface/60 backdrop-blur-xl ring-1 ring-theme-border shadow-xl shadow-theme p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_var(--shadow-color)] group flex flex-col justify-between min-h-[160px]",
              card.borderClass,
            )}
          >
            {isLoading ? (
              <div className="flex h-full flex-col justify-between space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-10 w-10 animate-pulse rounded-xl bg-surface-elevated" />
                </div>
                <div className="space-y-2">
                  <div className="h-8 w-24 animate-pulse rounded bg-surface-elevated" />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-bold tracking-widest text-content-secondary uppercase">{card.label}</p>
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-surface-elevated border border-theme-border/50 shadow-inner group-hover:bg-surface-elevated/80 transition-colors", card.colorClass)}>
                    {card.icon}
                  </div>
                </div>
                <div className="flex items-baseline mt-auto">
                  <h3 className="text-4xl font-bold text-content-primary tracking-tight font-space-grotesk">{card.value}</h3>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
