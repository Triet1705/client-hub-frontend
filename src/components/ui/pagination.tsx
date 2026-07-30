import { cn } from "@/lib/utils";

interface PaginationProps {
  /** 0-based page index */
  page: number;
  totalPages: number;
  totalElements: number;
  onPageChange: (page: number) => void;
  className?: string;
  /** Label for the entity, e.g. "projects", "invoices" — default "items" */
  label?: string;
}

/**
 * Reusable Prev/Next pagination footer.
 * Shows "Page X of Y (N total)" + Prev/Next buttons.
 * Renders nothing when totalPages ≤ 0.
 */
export function Pagination({
  page,
  totalPages,
  totalElements,
  onPageChange,
  className,
  label = "items",
}: PaginationProps) {
  if (totalPages <= 0) return null;

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-theme-border px-6 py-4",
        className,
      )}
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-content-muted">
        Page {page + 1} of {totalPages}{" "}
        <span className="font-normal normal-case text-content-muted">
          ({totalElements} {label})
        </span>
      </p>

      <div className="flex gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="flex h-8 items-center justify-center rounded px-3 text-xs font-bold text-content-secondary transition-colors hover:bg-surface-sunken disabled:opacity-40"
        >
          Prev
        </button>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="flex h-8 items-center justify-center rounded px-3 text-xs font-bold text-content-secondary transition-colors hover:bg-surface-sunken disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
