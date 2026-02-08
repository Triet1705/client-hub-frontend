"use client";

import React from "react";

interface ActionPlusIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ActionPlusIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ActionPlusIconProps) {
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
          fill={accentColor}
          opacity="0.1"
        />
      )}

      <g opacity={isActive ? "1" : "0.7"}>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        <line
          x1="12"
          y1="7"
          x2="12"
          y2="17"
          stroke={accentColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        <line
          x1="7"
          y1="12"
          x2="17"
          y2="12"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
