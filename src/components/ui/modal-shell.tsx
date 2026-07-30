"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  isPending?: boolean;
  title: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}

export function ModalShell({
  isOpen,
  onClose,
  isPending = false,
  title,
  maxWidth = "max-w-xl",
  children,
  footer,
}: ModalShellProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isPending) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, isPending, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-[var(--overlay)] backdrop-blur-md"
        onClick={isPending ? undefined : onClose}
      />

      <div
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface text-content-primary shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-theme-border px-4 py-4 sm:px-8 sm:py-6">
          <h3 className="min-w-0 truncate text-lg font-bold tracking-tight text-content-primary sm:text-xl">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-content-muted transition-colors hover:text-content-primary disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 custom-scrollbar sm:px-8 sm:py-7">
          {children}
        </div>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-theme-border bg-surface-sunken/45 px-4 py-4 sm:gap-3 sm:px-8 sm:py-5">
          {footer}
        </div>
      </div>
    </div>
  );
}
