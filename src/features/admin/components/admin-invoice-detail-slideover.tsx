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
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 transition-opacity duration-300" 
        onClick={onClose}
      />

      {/* Slideover panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 shadow-2xl z-50 border-l border-slate-800 animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white tracking-wide">Invoice Details</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">INV-{invoice.id}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          {/* Header Info */}
          <div>
            <h3 className="text-2xl font-mono font-bold text-emerald-400">
              ${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h3>
            <div className="mt-4 flex items-center gap-3">
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ring-1 ${
                invoice.status === "PAID" ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/30" :
                invoice.status === "DRAFT" ? "bg-slate-500/10 text-slate-400 ring-slate-500/30" :
                invoice.status === "DISPUTED" ? "bg-red-500/10 text-red-400 ring-red-500/30" :
                "bg-amber-500/10 text-amber-400 ring-amber-500/30"
              }`}>
                {invoice.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                Tenant: {invoice.tenantId}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Project</p>
                <p className="text-sm font-medium text-white">{invoice.projectTitle}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 mb-1">Created By</p>
                <p className="text-sm font-medium text-white">{invoice.createdByEmail || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-white">
                  {format(new Date(invoice.createdAt), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onForceStatus}
              className="w-full flex justify-center items-center gap-2 rounded-xl bg-red-500/10 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20 transition-colors uppercase tracking-wider"
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
