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
          "w-full resize-none rounded-xl border bg-surface px-4 py-3 text-sm text-content-primary placeholder:text-content-muted transition-all focus:outline-none focus:ring-2 focus:ring-focus-ring/20",
          isError
            ? "border-status-danger-border focus:border-status-danger-text"
            : "border-theme-border focus:border-focus-ring",
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";
