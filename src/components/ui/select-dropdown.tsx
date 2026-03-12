"use client";

import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  color?: string;
}

interface SelectDropdownProps<T extends string = string> {
  options: SelectOption<T>[];
  value: T | "";
  onChange: (value: T) => void;
  placeholder?: string;
  loading?: boolean;
  disabled?: boolean;
  isError?: boolean;
  className?: string;
}

export function SelectDropdown<T extends string = string>({
  options,
  value,
  onChange,
  placeholder = "Select…",
  loading = false,
  disabled = false,
  isError = false,
  className,
}: SelectDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled || loading}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white",
          "flex items-center justify-between transition-all focus:outline-none",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          open
            ? "border-emerald-500 ring-2 ring-emerald-500/20"
            : isError
              ? "border-rose-500 hover:border-rose-400"
              : "border-slate-700 hover:border-slate-600",
        )}
      >
        {loading ? (
          <span className="text-slate-500 italic">Loading…</span>
        ) : selected ? (
          <span className={selected.color ?? "text-white"}>{selected.label}</span>
        ) : (
          <span className="text-slate-500">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-50 shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-slate-800 first:rounded-t-xl last:rounded-b-xl"
              >
                <span className={opt.color ?? "text-white"}>{opt.label}</span>
                {value === opt.value && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
