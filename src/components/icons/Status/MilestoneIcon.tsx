"use client";

import React from "react";

interface MilestoneIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function MilestoneIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: MilestoneIconProps) {
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
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="21"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <rect
          x="10"
          y="4"
          width="4"
          height="3"
          rx="0.5"
          fill={accentColor}
          opacity="0.8"
        />
        <line
          x1="12"
          y1="7"
          x2="12"
          y2="9"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.5"
        />

        <circle cx="12" cy="12" r="2" fill={primaryColor} opacity="0.8" />
        <circle
          cx="12"
          cy="12"
          r="3"
          fill="none"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
        />

        <path
          d="M10 18 L11.5 19.5 L14 16.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
