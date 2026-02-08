"use client";

import React from "react";

interface NavProjectsIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavProjectsIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavProjectsIconProps) {
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
          y="12"
          width="6"
          height="9"
          rx="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <line
          x1="4"
          y1="14"
          x2="8"
          y2="14"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.5"
        />
        <line
          x1="4"
          y1="17"
          x2="8"
          y2="17"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.5"
        />

        <rect
          x="9"
          y="9"
          width="6"
          height="9"
          rx="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="1.5" fill={accentColor} opacity="0.7" />
        <circle cx="12" cy="16" r="1.5" fill={accentColor} opacity="0.7" />

        <rect
          x="15"
          y="6"
          width="6"
          height="9"
          rx="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <path
          d="M17 8 L19 9 M19 8 L21 9"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />
        <path
          d="M17 13 L19 14 M19 13 L21 14"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
