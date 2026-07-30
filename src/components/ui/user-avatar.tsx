import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  className?: string;
  sizeClass?: string;
}

function getInitials(name: string): string {
  const normalized = name.trim();
  if (!normalized) {
    return "?";
  }

  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({ name, className, sizeClass = "w-6 h-6 text-[10px]" }: UserAvatarProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-surface-sunken font-bold text-content-primary",
        sizeClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
