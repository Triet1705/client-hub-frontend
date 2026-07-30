"use client";

import * as React from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

export interface RowActionMenuItem {
  key: string;
  label: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
}

interface RowActionMenuProps {
  items: RowActionMenuItem[];
  align?: "left" | "right";
}

export function RowActionMenu({ items, align = "right" }: RowActionMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const alignmentClass = align === "left" ? "left-0" : "right-0";

  return (
    <div className="relative inline-flex" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-theme-border bg-surface text-content-secondary transition-colors hover:border-content-muted hover:text-content-primary"
        aria-label="Open row actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          className={`absolute ${alignmentClass} top-10 z-20 flex min-w-44 flex-col gap-0.5 rounded-md border border-theme-border bg-popover p-1 text-popover-foreground shadow-xl`}
          role="menu"
        >
          {items.map((item) => {
            const commonClass = "block w-full whitespace-nowrap rounded-sm px-3 py-2 text-left text-xs text-content-secondary transition-colors hover:bg-surface-sunken hover:text-content-primary disabled:cursor-not-allowed disabled:opacity-50";

            if (item.href) {
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={commonClass}
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if (item.disabled) return;
                  item.onClick?.();
                  setIsOpen(false);
                }}
                disabled={item.disabled}
                className={commonClass}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
