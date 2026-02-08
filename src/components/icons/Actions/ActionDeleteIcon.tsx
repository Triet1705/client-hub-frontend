"use client";

import React from "react";

interface ActionDeleteIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ActionDeleteIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ActionDeleteIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {isActive && (
        <rect
          x="0"
          y="0"
          width="24"
          height="24"
          rx="6"
          fill={primaryColor}
          opacity="0.1"
        />
      )}

      <g opacity={isActive ? "1" : "0.7"}>
        <path
          d="M8 2H16V3H8Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d="M3 5H21V6C21 6.5 20.5 7 20 7H4C3.5 7 3 6.5 3 6V5Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        <path
          d="M5 7H19C19.55 7 20 7.45 20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V8C4 7.45 4.45 7 5 7Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        <line
          x1="9"
          y1="11"
          x2="9"
          y2="18"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="12"
          y1="11"
          x2="12"
          y2="18"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <line
          x1="15"
          y1="11"
          x2="15"
          y2="18"
          stroke={accentColor}
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
