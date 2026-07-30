import * as React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterDropdownOption<T> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

interface FilterDropdownProps<T> {
  label: string;
  options: FilterDropdownOption<T>[];
  value: T;
  onChange: (value: T) => void;
  icon: LucideIcon;
  className?: string;
  dropdownClassName?: string;
}

export function FilterDropdown<T>({
  label,
  options,
  value,
  onChange,
  icon: Icon,
  className,
  dropdownClassName,
}: FilterDropdownProps<T>) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label || label;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border border-theme-border bg-surface px-3 py-1.5 text-xs text-content-secondary transition-colors hover:border-content-muted hover:text-content-primary",
          className
        )}
      >
        <Icon size={12} className="text-content-muted" />
        <span className="max-w-28 truncate">{selectedLabel}</span>
        <ChevronDown size={11} className={cn("text-content-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("no-scrollbar absolute right-0 z-50 mt-2 max-h-72 w-48 overflow-y-auto rounded-xl border border-theme-border bg-popover py-1 text-popover-foreground shadow-2xl", dropdownClassName)}>
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs transition-colors hover:bg-surface-sunken",
                value === option.value ? "text-theme-accent font-bold" : "text-content-secondary",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
