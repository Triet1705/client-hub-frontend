import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  iconClassName?: string;
}

export function SearchInput({ className, iconClassName, ...props }: SearchInputProps) {
  return (
    <div className="relative">
      <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500", iconClassName)} />
      <input
        {...props}
        className={cn(
          "w-full bg-slate-950/60 border border-white/10 rounded-xl pl-10 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all font-body",
          className
        )}
      />
    </div>
  );
}
