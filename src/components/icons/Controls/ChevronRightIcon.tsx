"use client";

import React from "react";

interface ChevronRightIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function ChevronRightIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: ChevronRightIconProps) {
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
        {/* Right chevron arrow */}
        <path
          d="M9 5 L15 12 L9 19"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Accent line */}
        <line
          x1="12"
          y1="8"
          x2="14"
          y2="12"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.6"
        />
      </g>
    </svg>
  );
}
