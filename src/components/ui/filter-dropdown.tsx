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
          "flex items-center gap-1.5 px-3 py-1.5 bg-white/4 border border-white/8 rounded-full text-xs text-slate-400 hover:border-white/20 hover:text-slate-200 transition-colors",
          className
        )}
      >
        <Icon size={12} className="text-slate-500" />
        <span className="max-w-28 truncate">{selectedLabel}</span>
        <ChevronDown size={11} className={cn("text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("absolute right-0 mt-2 w-48 bg-[#111111] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1 max-h-72 overflow-y-auto no-scrollbar", dropdownClassName)}>
          {options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition-colors",
                value === option.value ? "text-emerald-400 font-bold" : "text-slate-300",
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
