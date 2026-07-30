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
  size?: "sm" | "md";
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
  size = "md",
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
          "flex w-full items-center justify-between border bg-surface text-content-primary transition-all focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
          size === "sm" ? "h-8 rounded-md px-2 text-xs" : "rounded-xl px-4 py-3 text-sm",
          open
            ? "border-focus-ring ring-2 ring-focus-ring/20"
            : isError
              ? "border-status-danger-border hover:border-status-danger-text"
              : "border-theme-border hover:border-content-muted",
        )}
      >
        {loading ? (
          <span className="text-content-muted italic">Loading…</span>
        ) : selected ? (
          <span className={selected.color ?? "text-content-primary"}>{selected.label}</span>
        ) : (
          <span className="text-content-muted">{placeholder}</span>
        )}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-content-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 animate-in overflow-hidden rounded-xl border border-theme-border bg-popover text-popover-foreground shadow-2xl fade-in slide-in-from-top-1 duration-150">
          <div className="max-h-52 overflow-y-auto custom-scrollbar">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between px-4 transition-colors hover:bg-surface-sunken",
                  size === "sm" ? "py-2 text-xs first:rounded-t-md last:rounded-b-md" : "py-3 text-sm first:rounded-t-xl last:rounded-b-xl"
                )}
              >
                <span className={opt.color ?? "text-content-primary"}>{opt.label}</span>
                {value === opt.value && <Check className="h-4 w-4 shrink-0 text-theme-accent" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
