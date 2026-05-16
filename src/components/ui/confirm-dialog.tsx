import * as React from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}: ConfirmDialogProps) {
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

  if (!isOpen || !isMounted) return null;

  return createPortal(
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={!isLoading ? onCancel : undefined}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[#1e293b] rounded-2xl shadow-2xl z-[101] border border-slate-800 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="p-6">
          <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
          <div className="text-sm text-slate-300">{message}</div>
        </div>
        <div className="bg-slate-900/50 border-t border-slate-800 p-4 flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="text-slate-400 hover:text-white"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={isDestructive ? "bg-red-600 hover:bg-red-500 text-white" : "bg-emerald-600 hover:bg-emerald-500 text-white"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
