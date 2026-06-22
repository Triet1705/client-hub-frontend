import { cn } from "@/lib/utils";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "emerald";
}

export function GradientText({
  children,
  className,
  variant = "default",
}: GradientTextProps) {
  return (
    <span
      className={cn(
        variant === "default" ? "text-gradient" : "text-gradient-emerald",
        className
      )}
    >
      {children}
    </span>
  );
}
