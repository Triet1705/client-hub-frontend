"use client";

import React from "react";

interface PersonIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Person Icon — User silhouette with accent badge
 * Used in registration form full-name input field
 */
export function PersonIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: PersonIconProps) {
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
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        <path
          d="M5 20v-1a7 7 0 0 1 14 0v1"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="17.5" cy="5.5" r="2" fill={accentColor} />
      </g>
    </svg>
  );
}
