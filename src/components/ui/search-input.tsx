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
      <Search className={cn("absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-content-muted", iconClassName)} />
      <input
        {...props}
        className={cn(
          "w-full rounded-xl border border-theme-border bg-surface py-2 pl-10 pr-3 font-body text-sm text-content-primary placeholder:text-content-muted transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring/30",
          className
        )}
      />
    </div>
  );
}
