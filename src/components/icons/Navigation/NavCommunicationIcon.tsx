"use client";

import React from "react";

interface NavCommunicationIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function NavCommunicationIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: NavCommunicationIconProps) {
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
          d="M3 8 L3 14 Q3 16 5 16 L12 16 L14 19 L12 16 Q15 16 15 14 L15 8 Q15 6 13 6 L5 6 Q3 6 3 8"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />
        <line
          x1="5"
          y1="9"
          x2="13"
          y2="9"
          stroke={primaryColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="5"
          y1="12"
          x2="11"
          y2="12"
          stroke={primaryColor}
          strokeWidth="0.8"
          opacity="0.5"
        />

        <circle
          cx="18"
          cy="10"
          r="3"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />
        <line
          x1="16.5"
          y1="10"
          x2="19.5"
          y2="10"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        <path
          d="M17 15 Q17 17 19 17 L21 17 L20 19 L21 17 Q23 17 23 15"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1"
          opacity="0.6"
        />

        <line
          x1="15"
          y1="13"
          x2="17"
          y2="15"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
          strokeDasharray="2"
        />
      </g>
    </svg>
  );
}
