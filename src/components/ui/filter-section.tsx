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
    <section className="rounded-xl border border-slate-800 bg-slate-950/40 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )}
      </button>
      {isOpen ? <div className="px-3 pb-3">{children}</div> : null}
    </section>
  );
}
