"use client";

import React from "react";

interface ActionViewIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ActionViewIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ActionViewIconProps) {
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
          d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />

        <circle
          cx="12"
          cy="12"
          r="3.5"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        <circle cx="12" cy="12" r="1.5" fill={accentColor} opacity="0.9" />

        <circle cx="13.5" cy="10.5" r="0.6" fill={accentColor} opacity="0.5" />
      </g>
    </svg>
  );
}
