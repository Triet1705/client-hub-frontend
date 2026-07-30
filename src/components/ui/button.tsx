import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = {
  variant: {
    default:
      "bg-action-primary text-action-primary-foreground hover:bg-action-primary-hover shadow-[0_0_15px_rgba(4,120,87,0.24)]",
    destructive:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    outline:
      "border border-theme-border bg-transparent text-content-primary hover:bg-surface-sunken",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    ghost: "text-content-secondary hover:bg-surface-sunken hover:text-content-primary",
    link: "text-theme-accent underline-offset-4 hover:text-theme-accent-hover hover:underline",
    beam: "relative overflow-hidden border border-theme-accent/20 bg-surface hover:border-theme-accent/50 transition-all",
  },
  size: {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  },
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants.variant;
  size?: keyof typeof buttonVariants.size;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variantStyles = buttonVariants.variant[variant];
    const sizeStyles = buttonVariants.size[size];

    return (
      <button
        className={cn(baseStyles, variantStyles, sizeStyles, className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { Button };
