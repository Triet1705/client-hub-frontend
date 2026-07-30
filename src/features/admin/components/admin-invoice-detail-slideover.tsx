"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import type { AdminInvoice } from "../types/admin.types";

interface AdminInvoiceDetailSlideoverProps {
  invoice: AdminInvoice | null;
  isOpen: boolean;
  onClose: () => void;
  onForceStatus: () => void;
}

export function AdminInvoiceDetailSlideover({
  invoice,
  isOpen,
  onClose,
  onForceStatus,
}: AdminInvoiceDetailSlideoverProps) {
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !invoice || !isMounted) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-surface-base/60 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slideover panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-surface shadow-2xl z-50 border-l border-theme-border animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-theme-border">
          <div>
            <h2 className="text-lg font-bold text-content-primary tracking-wide">Invoice Details</h2>
            <p className="text-xs font-mono text-content-muted mt-1">INV-{invoice.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-surface-elevated text-content-secondary hover:text-content-primary transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Header Info */}
          <div>
            <h3 className="text-2xl font-mono font-bold text-theme-accent">
              ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ring-1 ${
                invoice.status === "PAID" ? "bg-action-subtle text-theme-accent ring-theme-accent" :
                invoice.status === "DRAFT" ? "bg-status-neutral-surface text-content-secondary ring-status-neutral-border" :
                invoice.status === "DISPUTED" ? "bg-status-danger-surface text-status-danger-text ring-status-danger-border" :
                "bg-status-warning-surface text-status-warning-text ring-status-warning-border"
              }`}>
                {invoice.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-mono text-content-secondary bg-surface-elevated/50 px-2 py-1 rounded">
                Tenant: {invoice.tenantId}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-content-muted uppercase tracking-widest border-b border-theme-border pb-2">Information</h4>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs text-content-muted mb-1">Project</p>
                <p className="text-sm font-medium text-content-primary">{invoice.projectTitle}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-content-muted mb-1">Created By</p>
                <p className="text-sm font-medium text-content-primary">{invoice.createdByEmail || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-content-muted mb-1">Created At</p>
                <p className="text-sm font-medium text-content-primary">
                  {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={onForceStatus}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-status-danger-surface px-4 py-3 text-sm font-bold text-status-danger-text hover:bg-status-danger-surface hover:text-status-danger-text border border-status-danger-border transition-colors uppercase tracking-wider"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Force Status Override
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
