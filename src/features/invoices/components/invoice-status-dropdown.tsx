"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { InvoiceStatus } from "@/lib/type";
import { InvoiceStatusPill } from "./invoice-status-pill";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { canTransitionTo } from "@/lib/invoice-status-mapper";
import { INVOICE_STATUS_LABELS } from "../constants/invoice.constants";

interface InvoiceStatusDropdownProps {
  invoiceId: string;
  status: InvoiceStatus;
  canEdit: boolean;
  onUpdate: (nextStatus: InvoiceStatus) => void;
  isPending?: boolean;
}

function getTransitionOptions(current: InvoiceStatus): InvoiceStatus[] {
  const allStatuses = Object.values(InvoiceStatus);
  return allStatuses.filter((status) => canTransitionTo(current, status));
}

export function InvoiceStatusDropdown({
  invoiceId,
  status,
  canEdit,
  onUpdate,
  isPending = false,
}: InvoiceStatusDropdownProps) {
  const [open, setOpen] = React.useState(false);
  const [confirmStatus, setConfirmStatus] = React.useState<InvoiceStatus | null>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });

  const transitions = React.useMemo(() => getTransitionOptions(status), [status]);
  const isEditable = canEdit && transitions.length > 0;

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setCoords({ top: rect.bottom + 8, left: rect.left });
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  React.useEffect(() => {
    if (!open) return;
    
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        buttonRef.current && !buttonRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };

    const handleScroll = () => setOpen(false);

    document.addEventListener("mousedown", handleOutsideClick);
    window.addEventListener("scroll", handleScroll, true);
    
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        ref={buttonRef}
        type="button"
        disabled={!isEditable || isPending}
        onClick={handleToggle}
        className={cn(
          "flex items-center gap-1.5 transition-opacity outline-none",
          isEditable && "hover:opacity-80 cursor-pointer",
          !isEditable && "cursor-default"
        )}
      >
        <InvoiceStatusPill status={status} />
        {isEditable && (
          <ChevronDown
            className={cn(
              "w-3 h-3 text-slate-400 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        )}
      </button>

      {/* Dropdown Menu (Portal) */}
      {open && isEditable && typeof document !== "undefined" && createPortal(
        <div
          ref={dropdownRef}
          style={{ top: coords.top, left: coords.left }}
          className="fixed w-48 bg-slate-900 border border-slate-700 rounded-xl overflow-hidden z-[100] shadow-2xl animate-in fade-in slide-in-from-top-1 duration-150"
        >
          <div className="flex flex-col py-1">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center gap-2 text-xs text-slate-400">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Current: {INVOICE_STATUS_LABELS[status]}</span>
            </div>
            <div className="max-h-52 overflow-y-auto custom-scrollbar">
              {transitions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    setConfirmStatus(opt);
                    setOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  {INVOICE_STATUS_LABELS[opt]}
                </button>
              ))}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmStatus !== null}
        title="Confirm Status Change"
        message={
          <>
            Change invoice status from <strong className="text-white">{INVOICE_STATUS_LABELS[status]}</strong> to{" "}
            <strong className="text-white">{confirmStatus && INVOICE_STATUS_LABELS[confirmStatus]}</strong>?
            <br />
            <span className="text-slate-400 mt-2 block">
              Depending on the status, this action may notify the other party and cannot be easily undone for terminal states.
            </span>
          </>
        }
        confirmText={isPending ? "Updating..." : "Confirm Change"}
        cancelText="Cancel"
        onConfirm={() => {
          if (confirmStatus) {
            onUpdate(confirmStatus);
          }
          setConfirmStatus(null);
        }}
        onCancel={() => setConfirmStatus(null)}
        isLoading={isPending}
      />
    </>
  );
}
