import * as React from "react";
import { cn } from "@/lib/utils";
import { ProjectStatus, TaskStatus } from "@/lib/type";

export type ActivityCategory = "PROJECT" | "TASK" | "INVOICE";

interface StatusActivityDotProps {
  category: ActivityCategory;
  status: string;
  className?: string;
}

export function StatusActivityDot({ category, status, className }: StatusActivityDotProps) {
  const isVisible =
    category === "PROJECT"
      ? status === ProjectStatus.IN_PROGRESS
      : category === "TASK"
        ? status === TaskStatus.IN_PROGRESS
        : ["SENT", "PENDING", "OVERDUE", "PAID"].includes(status);

  if (!isVisible) return null;

  const dotClass =
    category === "INVOICE"
      ? status === "PAID"
        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
        : status === "OVERDUE"
          ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)]"
          : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
      : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]";

  return (
    <span
      className={cn(
        "absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-[#0A0E17]",
        dotClass,
        className
      )}
    />
  );
}
