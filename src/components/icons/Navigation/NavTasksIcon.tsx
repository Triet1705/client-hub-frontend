"use client";

import React from "react";

interface NavTasksIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavTasksIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavTasksIconProps) {
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
        <rect
          x="3"
          y="3"
          width="14"
          height="16"
          rx="2"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <circle
          cx="6"
          cy="7"
          r="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <path
          d="M5 7 L6 8 L7.5 6"
          stroke={accentColor}
          strokeWidth="1.5"
          fill="none"
        />
        <line
          x1="9"
          y1="7"
          x2="14"
          y2="7"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <circle
          cx="6"
          cy="12"
          r="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <line
          x1="9"
          y1="12"
          x2="14"
          y2="12"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <circle
          cx="6"
          cy="17"
          r="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="9"
          y1="17"
          x2="14"
          y2="17"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <rect
          x="19"
          y="4"
          width="2"
          height="2"
          rx="0.5"
          fill={primaryColor}
          opacity="0.8"
        />
      </g>
    </svg>
  );
}
