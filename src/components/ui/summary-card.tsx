import * as React from "react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  iconClassName?: string;
  badge?: {
    label: string;
    variant: "amber" | "emerald" | "cyan" | "rose" | "indigo" | "blue" | "slate";
  };
  className?: string;
  isLoading?: boolean;
}

export function SummaryCard({ label, value, icon: Icon, iconClassName, badge, className, isLoading }: SummaryCardProps) {
  const variantClasses = {
    amber:   "bg-status-warning-surface text-status-warning-text bg-status-warning-surface ring-status-warning-border",
    emerald: "bg-status-success-surface text-status-success-text bg-status-success-surface ring-status-success-border",
    cyan:    "bg-status-info-surface text-status-info-text bg-status-info-surface ring-status-info-border",
    rose:    "bg-status-danger-surface text-status-danger-text bg-status-danger-surface ring-status-danger-border",
    indigo:  "bg-status-web3-surface text-status-web3-text bg-status-web3-surface ring-status-web3-border",
    blue:    "bg-status-info-surface text-status-info-text bg-status-info-surface ring-status-info-border",
    slate:   "bg-status-neutral-surface text-status-neutral-text bg-status-neutral-surface ring-status-neutral-border",
  };

  return (
    <div className={cn(
      "bg-surface-elevated/60 backdrop-blur-xl ring-1 ring-theme-border shadow-2xl shadow-theme p-6 rounded-3xl transition-all duration-300 group hover:bg-surface-elevated hover:ring-theme-accent/20 relative overflow-hidden",
      className
    )}>
      {badge && (
        <div className={cn("absolute inset-0 blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300", variantClasses[badge.variant].split(" ")[2])} />
      )}
      <div className="relative">
        <div className="flex justify-between items-start mb-6">
          <div className="flex flex-col gap-1">
            <p className="text-sm font-bold text-content-muted uppercase tracking-widest">{label}</p>
          </div>
          {badge && (
            <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ring-1 ring-inset whitespace-nowrap shrink-0", variantClasses[badge.variant])}>
              {badge.label}
            </span>
          )}
        </div>
        <div className="flex items-end justify-between">
          <span className="text-3xl lg:text-4xl font-bold text-content-primary font-space-grotesk tracking-tight">
            {isLoading ? (
              <span className="inline-block w-24 h-10 bg-surface-sunken animate-pulse rounded" />
            ) : (
              value
            )}
          </span>
          {Icon && (
            <div className={cn("p-2.5 rounded-2xl bg-surface-base ring-1 ring-theme-border text-content-muted group-hover:scale-110 transition-transform duration-300 shrink-0", iconClassName)}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
