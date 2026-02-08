"use client";

import React from "react";

interface ActionFilterIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ActionFilterIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ActionFilterIconProps) {
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
          d="M3 4H21L15 11V18L9 21V11Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinejoin="round"
        />

        <line
          x1="8"
          y1="4"
          x2="16"
          y2="4"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <circle cx="12" cy="15" r="1" fill={accentColor} opacity="0.8" />
      </g>
    </svg>
  );
}
