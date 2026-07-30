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
          "relative w-full overflow-hidden rounded-2xl border border-theme-border bg-surface text-content-primary shadow-2xl",
          "animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-theme-border px-8 py-6">
          <h3 className="text-xl font-bold tracking-tight text-content-primary">{title}</h3>
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

        <div className="px-8 py-7 overflow-y-auto custom-scrollbar max-h-[65vh]">
          {children}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-theme-border bg-surface-sunken/45 px-8 py-5">
          {footer}
        </div>
      </div>
    </div>
  );
}
