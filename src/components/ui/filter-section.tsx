"use client";

import * as React from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface FilterSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function FilterSection({ title, isOpen, onToggle, children }: FilterSectionProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-theme-border bg-surface">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-content-secondary">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-content-muted" />
        ) : (
          <ChevronRight className="h-4 w-4 text-content-muted" />
        )}
      </button>
      {isOpen ? <div className="px-3 pb-3">{children}</div> : null}
    </section>
  );
}
