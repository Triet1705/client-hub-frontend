"use client";

import React from "react";

interface ActionSearchIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ActionSearchIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ActionSearchIconProps) {
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
        <circle
          cx="10"
          cy="10"
          r="6"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        <path
          d="M7 7 Q10 8 12 11"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <line
          x1="15"
          y1="15"
          x2="21"
          y2="21"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <circle cx="21" cy="21" r="0.8" fill={accentColor} opacity="0.8" />
      </g>
    </svg>
  );
}
