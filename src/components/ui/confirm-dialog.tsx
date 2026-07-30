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
        className="fixed inset-0 z-[100] animate-in bg-[var(--overlay)] backdrop-blur-sm fade-in duration-200"
        onClick={!isLoading ? onCancel : undefined}
      />
      <div className="fixed left-1/2 top-1/2 z-[101] flex w-full max-w-sm -translate-x-1/2 -translate-y-1/2 animate-in flex-col overflow-hidden rounded-2xl border border-theme-border bg-surface text-content-primary shadow-2xl zoom-in-95 duration-200">
        <div className="p-6">
          <h2 className="mb-2 text-lg font-bold text-content-primary">{title}</h2>
          <div className="text-sm text-content-secondary">{message}</div>
        </div>
        <div className="flex justify-end gap-3 border-t border-theme-border bg-surface-sunken/45 p-4">
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="text-content-secondary hover:text-content-primary"
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isLoading}
            className={isDestructive ? "bg-action-danger text-action-danger-foreground hover:bg-action-danger-hover" : "bg-action-primary text-action-primary-foreground hover:bg-action-primary-hover"}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>,
    document.body
  );
}
