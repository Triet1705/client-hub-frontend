import * as React from "react";
import { cn } from "@/lib/utils";

interface GaugeChartProps {
  label: string;
  subLabel?: string;
  // If true, shows a fractional arc (used vs max). If false, it's a categorical status.
  isFractional?: boolean;
  value?: number; // Used for fractional
  max?: number;   // Used for fractional
  status?: "UP" | "DEGRADED" | "DOWN"; // Used for categorical or color overrides
  className?: string;
}

const statusColors = {
  UP: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
  DEGRADED: "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]",
  DOWN: "text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]",
};

export function GaugeChart({
  label,
  subLabel,
  isFractional,
  value = 0,
  max = 100,
  status = "UP",
  className,
}: GaugeChartProps) {
  const percent = isFractional && max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : (status === "UP" ? 100 : status === "DEGRADED" ? 50 : 15);
  
  let colorClass = statusColors[status];
  if (isFractional) {
    if (percent < 70) colorClass = statusColors.UP;
    else if (percent < 90) colorClass = statusColors.DEGRADED;
    else colorClass = statusColors.DOWN;
  }

  return (
    <div className={cn("relative flex flex-col items-center justify-center p-5 rounded-3xl border border-theme-border bg-surface-elevated/70 shadow-2xl shadow-black/50 overflow-hidden", className)}>
      <div className="relative w-32 h-20">
        {/* Background Arc */}
        <svg viewBox="0 0 200 120" className="absolute top-0 left-0 w-full h-full">
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            className="text-surface-base"
          />
          {/* Foreground Arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="16"
            strokeLinecap="round"
            pathLength="100"
            strokeDasharray="100"
            strokeDashoffset={100 - percent}
            className={cn("transition-all duration-1000 ease-out", colorClass)}
          />
        </svg>

        {/* Inner Text */}
        <div className="absolute bottom-0 left-0 w-full text-center">
          <p className="text-2xl font-bold tracking-tight text-content-primary drop-shadow-md">
            {isFractional ? `${Math.round(percent)}%` : status}
          </p>
        </div>
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-sm font-bold tracking-widest text-content-secondary">{label}</h3>
        {(subLabel || isFractional) && (
          <p className="mt-1 text-[11px] uppercase tracking-wider font-bold text-content-muted">
            {subLabel || (isFractional ? `${value} / ${max}` : "")}
          </p>
        )}
      </div>
    </div>
  );
}
