import { cn } from "@/lib/utils";

export interface FilterPillOption<T extends string = string> {
  label: string;
  value: T;
}

interface FilterPillsProps<T extends string = string> {
  options: FilterPillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * Horizontal strip of filter pills. Generic over the value enum/union type.
 * Active pill: emerald-filled. Inactive: ghost with slate border.
 */
export function FilterPills<T extends string = string>({
  options,
  value,
  onChange,
  className,
}: FilterPillsProps<T>) {
  return (
    <div className={cn("flex gap-2 flex-wrap", className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "px-4 py-1.5 rounded-full text-[11px] font-bold transition-colors",
            value === opt.value
              ? "bg-emerald-500 text-white"
              : "border border-slate-700 hover:bg-white/5 text-slate-400",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
