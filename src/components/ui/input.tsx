import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, isError, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20",
          isError 
            ? "border-rose-500 focus:border-rose-500" 
            : "border-slate-700 focus:border-emerald-500",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
