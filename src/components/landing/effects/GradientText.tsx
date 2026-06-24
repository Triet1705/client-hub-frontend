import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "emerald" | "blue" | "purple";
}

export function GradientText({
  children,
  className = "",
  variant = "default",
}: GradientTextProps) {
  const gradients = {
    default: "bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60",
    emerald: "bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-emerald-600",
    blue: "bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600",
    purple: "bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-600",
  };

  return (
    <span
      className={cn(
        gradients[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
