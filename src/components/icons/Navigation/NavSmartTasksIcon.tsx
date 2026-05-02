"use client";

import React from "react";

interface NavSmartTasksIconProps {
  className?: string;
  isActive?: boolean;
}

export function NavSmartTasksIcon({
  className = "w-6 h-6",
  isActive = false,
}: NavSmartTasksIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isActive && (
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="6"
          fill="currentColor"
          opacity="0.1"
          stroke="none"
        />
      )}
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" opacity={isActive ? "1" : "0.7"} />
      <path d="M12 8l-2 4h4l-2 4" strokeWidth="1.5" stroke="currentColor" opacity={isActive ? "1" : "0.7"} />
    </svg>
  );
}
