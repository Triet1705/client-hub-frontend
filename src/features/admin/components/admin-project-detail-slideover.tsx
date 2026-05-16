"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import type { AdminProject } from "../types/admin.types";

interface AdminProjectDetailSlideoverProps {
  project: AdminProject | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AdminProjectDetailSlideover({
  project,
  isOpen,
  onClose,
}: AdminProjectDetailSlideoverProps) {
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

  if (!isOpen || !project || !isMounted) return null;

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
            <h2 className="text-lg font-bold text-white tracking-wide">Project Details</h2>
            <p className="text-xs font-mono text-slate-500 mt-1">{project.id}</p>
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
            <h3 className="text-2xl font-bold text-white">{project.title}</h3>
            <div className="mt-4 flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-slate-800 text-slate-300 uppercase ring-1 ring-slate-700">
                {project.status.replace(/_/g, " ")}
              </span>
              <span className="text-sm font-mono text-slate-400 bg-slate-800/50 px-2 py-1 rounded">
                Tenant: {project.tenantId}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Information</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner Name</p>
                <p className="text-sm font-medium text-white">{project.ownerName || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Owner Email</p>
                <p className="text-sm font-medium text-white">{project.ownerEmail || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Members</p>
                <p className="text-sm font-medium text-white">{project.memberCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Tasks</p>
                <p className="text-sm font-medium text-white">{project.taskCount}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Budget</p>
                <p className="text-sm font-mono font-bold text-emerald-400">
                  ${Number(project.budget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Created</p>
                <p className="text-sm font-medium text-white">
                  {format(new Date(project.createdAt), "MMM d, yyyy")}
                </p>
              </div>
              {project.deadline && (
                <div>
                  <p className="text-xs text-slate-500 mb-1">Deadline</p>
                  <p className="text-sm font-medium text-white">
                    {format(new Date(project.deadline), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
