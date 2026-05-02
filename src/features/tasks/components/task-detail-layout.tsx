"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskDetailLayoutProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  headerBadge?: React.ReactNode;
  headerActions?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  tabs?: { id: string; label: string }[];
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export function TaskDetailLayout({
  isOpen,
  title,
  onClose,
  headerBadge,
  headerActions,
  children,
  footer,
  tabs,
  activeTab,
  onTabChange,
}: TaskDetailLayoutProps) {
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      <aside
        aria-hidden={!isOpen}
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-140 bg-[#111827] border-l border-[#1f2937]",
          "flex flex-col shadow-2xl transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="p-6 border-b border-[#1f2937] flex items-start justify-between shrink-0 bg-[#111827]">
          <div className="flex-1 min-w-0 pr-4">
            {headerBadge ? <div className="mb-2">{headerBadge}</div> : null}
            <h2 className="text-lg font-bold text-slate-100 leading-tight">{title}</h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-slate-800"
              aria-label="Close task detail"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {tabs && tabs.length > 0 && (
          <div className="flex px-6 border-b border-[#1f2937] bg-[#111827] shrink-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={cn(
                  "py-3 px-4 text-sm font-medium border-b-2 transition-colors",
                  activeTab === tab.id
                    ? "border-emerald-500 text-emerald-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar flex flex-col min-h-0">
          {children}
        </main>

        {footer ? (
          <footer className="p-6 border-t border-[#1f2937] bg-[#0a0c10]/50 flex items-center gap-3 shrink-0">
            {footer}
          </footer>
        ) : null}
      </aside>
    </>
  );
}
