import * as React from "react";
import { useForceInvoiceStatusMutation } from "../hooks/use-admin";
import { InvoiceStatus } from "@/lib/type";
import { CloseIcon, WarningTriangleIcon } from "@/components/icons";
import { SelectDropdown, type SelectOption } from "@/components/ui/select-dropdown";

interface ForceStatusModalProps {
  invoiceId: string | number;
  currentStatus: InvoiceStatus;
  isOpen: boolean;
  onClose: () => void;
}

const INVOICE_STATUSES = Object.values(InvoiceStatus);
const STATUS_OPTIONS: SelectOption[] = INVOICE_STATUSES.map(s => ({ value: s, label: s }));

export function ForceStatusModal({ invoiceId, currentStatus, isOpen, onClose }: ForceStatusModalProps) {
  const [targetStatus, setTargetStatus] = React.useState<InvoiceStatus>(currentStatus);
  const [reason, setReason] = React.useState("");

  const forceStatusMutation = useForceInvoiceStatusMutation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    forceStatusMutation.mutate(
      { id: invoiceId, req: { status: targetStatus, reason } },
      {
        onSuccess: () => {
          onClose();
        }
      }
    );
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-in bg-[var(--overlay)] backdrop-blur-sm fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-surface-elevated rounded-2xl shadow-2xl z-50 border border-theme-border animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-6 border-b border-theme-border">
          <div>
            <h2 className="text-xl font-bold text-content-primary">Force Update Status</h2>
            <p className="text-xs text-content-secondary mt-1">Invoice #{invoiceId}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition-colors"
          >
            <CloseIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-status-warning-surface border border-status-warning-border rounded-xl p-4 flex gap-3">
            <WarningTriangleIcon className="h-5 w-5 shrink-0" primaryColor="var(--status-warning-text)" accentColor="var(--status-warning-border)" />
            <div>
              <p className="text-sm font-bold text-status-warning-text">DANGER ZONE</p>
              <p className="text-xs text-status-warning-text/80 mt-1">
                This bypasses all state-machine validation. This action is audited and logged immutably.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-content-secondary mb-2">Current Status</label>
              <div className="px-4 py-2 bg-surface border border-theme-border rounded-lg text-content-secondary font-mono text-sm opacity-70">
                {currentStatus}
              </div>
            </div>

            <div>
              <label className="block text-sm text-content-primary mb-2">Target Status</label>
              <SelectDropdown
                options={STATUS_OPTIONS}
                value={targetStatus}
                onChange={(v) => setTargetStatus(v as InvoiceStatus)}
                disabled={forceStatusMutation.isPending}
              />
            </div>

            <div>
              <label className="block text-sm text-content-primary mb-2">Reason for Force Update <span className="text-status-danger-text">*</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Required for audit logging..."
                className="w-full bg-surface border border-theme-border text-content-primary rounded-lg p-3 text-sm focus:ring-theme-accent focus:border-theme-accent min-h-[100px] resize-none"
                required
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-theme-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-content-secondary hover:text-content-primary hover:bg-surface-elevated transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || forceStatusMutation.isPending || targetStatus === currentStatus}
              className="px-4 py-2 rounded-lg text-sm font-bold text-action-danger-foreground bg-action-danger hover:bg-action-danger-hover transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {forceStatusMutation.isPending && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-action-danger-foreground border-t-transparent" />
              )}
              Force Update Status
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
