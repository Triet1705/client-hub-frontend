"use client";

import * as React from "react";
import { Settings2 } from "lucide-react";

export interface ColumnOption {
  key: string;
  label: string;
  locked?: boolean;
}

interface ChangeColumnTablePopupProps {
  columns: ColumnOption[];
  visibleColumns: Record<string, boolean>;
  onToggleColumn: (key: string) => void;
  onResetColumns?: () => void;
}

export function ChangeColumnTablePopup({
  columns,
  visibleColumns,
  onToggleColumn,
  onResetColumns,
}: ChangeColumnTablePopupProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-8 items-center gap-2 rounded-md border border-theme-border bg-surface px-2.5 text-xs font-bold text-content-secondary transition-colors hover:border-content-muted hover:text-content-primary"
      >
        <Settings2 className="h-3.5 w-3.5" />
        Columns
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-10 z-30 min-w-60 rounded-xl border border-theme-border bg-popover p-3 text-popover-foreground shadow-2xl backdrop-blur-xl">
          <p className="pb-3 text-[10px] font-bold uppercase tracking-wider text-content-muted">
            Visible Columns
          </p>

          <div className="flex flex-wrap gap-2">
            {columns.map((column) => {
              const checked = visibleColumns[column.key] ?? false;

              if (column.locked) {
                return (
                  <span
                    key={column.key}
                    className="inline-flex cursor-default items-center rounded-full border border-status-success-border bg-status-success-surface px-3 py-1.5 text-xs font-semibold text-status-success-text opacity-80"
                  >
                    {column.label}
                  </span>
                );
              }

              return (
                <button
                  key={column.key}
                  type="button"
                  onClick={() => onToggleColumn(column.key)}
                  className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                    checked
                      ? "border-status-success-border bg-status-success-surface text-status-success-text"
                      : "border-theme-border bg-surface text-content-secondary hover:border-content-muted hover:text-content-primary"
                  }`}
                >
                  {column.label}
                </button>
              );
            })}
          </div>

          {onResetColumns ? (
            <button
              type="button"
              onClick={() => {
                onResetColumns();
                setIsOpen(false);
              }}
              className="mt-4 w-full rounded-lg border border-theme-border bg-surface-sunken/60 px-3 py-2 text-xs font-bold text-content-secondary transition-colors hover:border-content-muted hover:bg-surface-sunken hover:text-content-primary"
            >
              Reset Columns
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
