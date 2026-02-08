"use client";

import React from "react";

interface NavDashboardIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavDashboardIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavDashboardIconProps) {
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
          x="2"
          y="2"
          width="8"
          height="8"
          rx="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <line
          x1="4"
          y1="4"
          x2="8"
          y2="8"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />
        <line
          x1="8"
          y1="4"
          x2="4"
          y2="8"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <rect
          x="14"
          y="2"
          width="8"
          height="8"
          rx="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <circle cx="18" cy="6" r="2" fill={accentColor} opacity="0.8" />

        <rect
          x="2"
          y="14"
          width="8"
          height="8"
          rx="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <path
          d="M4 18 L6 16 L8 18 L10 16"
          stroke={accentColor}
          strokeWidth="1"
          fill="none"
        />

        <rect
          x="14"
          y="14"
          width="8"
          height="8"
          rx="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <rect
          x="16"
          y="16"
          width="4"
          height="4"
          rx="1"
          fill={primaryColor}
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
