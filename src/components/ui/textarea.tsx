import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  isError?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, isError, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-slate-900/50 border rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none",
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

Textarea.displayName = "Textarea";
