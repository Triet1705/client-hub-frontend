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
        "px-6 py-4 border-t border-slate-800 flex items-center justify-between",
        className,
      )}
    >
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
        Page {page + 1} of {totalPages}{" "}
        <span className="text-slate-600 normal-case font-normal">
          ({totalElements} {label})
        </span>
      </p>

      <div className="flex gap-1">
        <button
          disabled={page === 0}
          onClick={() => onPageChange(page - 1)}
          className="px-3 h-8 flex items-center justify-center rounded hover:bg-white/5 text-slate-400 text-xs font-bold disabled:opacity-40 transition-colors"
        >
          Prev
        </button>
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onPageChange(page + 1)}
          className="px-3 h-8 flex items-center justify-center rounded hover:bg-white/5 text-slate-400 text-xs font-bold disabled:opacity-40 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
