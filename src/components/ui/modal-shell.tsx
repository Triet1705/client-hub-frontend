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
        className="absolute inset-0 backdrop-blur-md bg-black/60"
        onClick={isPending ? undefined : onClose}
      />

      <div
        className={cn(
          "relative w-full bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden",
          "animate-in fade-in zoom-in-95 duration-200",
          maxWidth,
        )}
      >
        <div className="px-8 py-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="text-slate-500 hover:text-white transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-8 py-7 overflow-y-auto max-h-[65vh]">
          {children}
        </div>

        <div className="px-8 py-5 bg-slate-900/30 border-t border-slate-800 flex items-center justify-end gap-3 shrink-0">
          {footer}
        </div>
      </div>
    </div>
  );
}
