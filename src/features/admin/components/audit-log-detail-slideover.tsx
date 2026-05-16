import * as React from "react";
import { format } from "date-fns";
import { createPortal } from "react-dom";
import type { AdminAuditLogResponse } from "../types/admin.types";
import { CloseIcon, AuditLoggingIcon } from "@/components/icons";
import { RoleBadge } from "./role-badge";

interface SlideoverProps {
  log: AdminAuditLogResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AuditLogDetailSlideover({ log, isOpen, onClose }: SlideoverProps) {
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

  if (!isOpen || !isMounted || !log) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-surface-elevated shadow-2xl z-50 flex flex-col border-l border-theme-border animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b border-theme-border bg-surface-sunken/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-theme-accent/10 flex items-center justify-center text-theme-accent">
              <AuditLoggingIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-content-primary tracking-wide">Audit Log Detail</h2>
              <p className="text-xs text-content-muted">Event #{log.id} • {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface transition-colors"
          >
            <CloseIcon className="h-5 w-5" primaryColor="currentColor" accentColor="currentColor" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          {/* Action Header */}
          <div className="flex flex-col items-center justify-center p-6 bg-surface-sunken rounded-xl border border-theme-border">
            <span className="text-sm font-medium text-content-muted uppercase tracking-widest mb-1">Action</span>
            <span className="text-2xl font-bold text-content-primary mb-3">{log.action.replace(/_/g, " ")}</span>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-surface-base text-content-secondary uppercase">
                {log.entityType}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wider bg-emerald-500/10 text-emerald-400 uppercase ring-1 ring-inset ring-emerald-500/20">
                {log.isAnchored ? "Anchored" : "Pending Anchor"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Actor Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Actor</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-content-muted mb-1">User Email</p>
                  <p className="text-sm text-content-primary font-medium">{log.userEmail || "Anonymous"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">User ID</p>
                  <p className="text-xs text-content-secondary font-mono break-all">{log.userId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Role</p>
                  <div className="inline-block mt-0.5">
                    <RoleBadge role={log.userRole || "N/A"} />
                  </div>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Tenant ID</p>
                  <p className="text-xs text-content-secondary font-mono">{log.tenantId || "SYSTEM"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">IP Address</p>
                  <p className="text-xs text-content-secondary font-mono">{log.ipAddress || "—"}</p>
                </div>
              </div>
            </div>

            {/* Target Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Target</h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-content-muted mb-1">Entity Type</p>
                  <p className="text-sm text-content-primary font-medium uppercase">{log.entityType}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Entity ID</p>
                  <p className="text-xs text-content-secondary font-mono break-all">{log.entityId || "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-content-muted mb-1">Data Hash</p>
                  <div className="bg-surface-sunken p-2 rounded border border-theme-border break-all text-[10px] font-mono text-content-muted">
                    {log.dataHash || "—"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Data Changes */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b border-theme-border pb-2">Data Changes</h4>
            
            {(log.oldValue || log.newValue) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {log.oldValue && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-rose-400">Previous State</p>
                    <pre className="bg-surface-sunken border border-theme-border rounded-lg p-4 text-[11px] font-mono text-content-secondary overflow-x-auto whitespace-pre-wrap">
                      {log.oldValue}
                    </pre>
                  </div>
                )}
                
                {log.newValue && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-theme-accent">New State</p>
                    <pre className="bg-surface-sunken border border-theme-border rounded-lg p-4 text-[11px] font-mono text-content-secondary overflow-x-auto whitespace-pre-wrap">
                      {log.newValue}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 bg-surface-sunken rounded-xl border border-theme-border text-content-muted text-sm">
                No payload changes recorded for this event.
              </div>
            )}
          </div>
          
        </div>
      </div>
    </>,
    document.body
  );
}
