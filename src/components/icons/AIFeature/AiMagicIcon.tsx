"use client";

import React from "react";

interface AiMagicIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function AiMagicIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: AiMagicIconProps) {
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
          x1="3"
          y1="20"
          x2="16"
          y2="7"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <path
          d="M16 2 L17 5 L20 6 L17 7 L16 10 L15 7 L12 6 L15 5 Z"
          fill={accentColor}
          opacity="0.9"
        />

        <path
          d="M8 10 L8.5 11.5 L10 12 L8.5 12.5 L8 14 L7.5 12.5 L6 12 L7.5 11.5 Z"
          fill={primaryColor}
          opacity="0.6"
        />

        <path
          d="M18 12 L18.5 13 L19.5 13.5 L18.5 14 L18 15 L17.5 14 L16.5 13.5 L17.5 13 Z"
          fill={accentColor}
          opacity="0.7"
        />

        <circle
          cx="5"
          cy="18"
          r="1.5"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
