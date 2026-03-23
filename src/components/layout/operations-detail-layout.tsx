"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface OperationsDetailLayoutProps {
  main: React.ReactNode;
  sidebar: React.ReactNode;
  className?: string;
  minHeightClassName?: string;
  sidebarWidthClassName?: string;
}

export function OperationsDetailLayout({
  main,
  sidebar,
  className,
  minHeightClassName = "min-h-162.5",
  sidebarWidthClassName = "xl:grid-cols-[minmax(0,1fr)_320px]",
}: OperationsDetailLayoutProps) {
  return (
    <div
      className={cn(
        "bg-slate-900/60 backdrop-blur-xl ring-1 ring-white/5 shadow-2xl shadow-black/50 p-6 rounded-3xl animate-in fade-in",
        "grid grid-cols-1 gap-6 md:gap-8",
        sidebarWidthClassName,
        minHeightClassName,
        className,
      )}
    >
      {main}
      {sidebar}
    </div>
  );
}
