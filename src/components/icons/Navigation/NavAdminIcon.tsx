"use client";

import React from "react";

interface NavAdminIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavAdminIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavAdminIconProps) {
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
          y="3"
          width="16"
          height="14"
          rx="2"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <line
          x1="2"
          y1="7"
          x2="18"
          y2="7"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.4"
        />

        <circle
          cx="6"
          cy="10"
          r="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="6"
          y1="8"
          x2="6"
          y2="9"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <circle
          cx="12"
          cy="10"
          r="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="12"
          y1="8"
          x2="12"
          y2="9"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <circle
          cx="18"
          cy="10"
          r="1.5"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="18"
          y1="8"
          x2="18"
          y2="9"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <rect
          x="4"
          y="13"
          width="2"
          height="3"
          rx="0.5"
          fill={primaryColor}
          opacity="0.6"
        />
        <rect
          x="8"
          y="13"
          width="2"
          height="3"
          rx="0.5"
          fill={primaryColor}
          opacity="0.6"
        />
        <rect
          x="12"
          y="13"
          width="2"
          height="3"
          rx="0.5"
          fill={primaryColor}
          opacity="0.6"
        />

        <circle
          cx="20"
          cy="6"
          r="2"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.8"
        />
        <line
          x1="20"
          y1="4"
          x2="20"
          y2="6"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.7"
        />
      </g>
    </svg>
  );
}
