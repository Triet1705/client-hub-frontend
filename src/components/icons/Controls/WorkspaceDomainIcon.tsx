"use client";

import React from "react";

interface WorkspaceDomainIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

/**
 * Workspace Domain Icon — Building/Organization
 * Used in workspace/organization domain input fields
 */
export function WorkspaceDomainIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: WorkspaceDomainIconProps) {
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
        {/* Main building body */}
        <rect
          x="4"
          y="5"
          width="10"
          height="16"
          rx="1"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Side wing / annex */}
        <path
          d="M14 11H19C19.5 11 20 11.5 20 12V21H14"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Main building windows — row 1 */}
        <rect
          x="7"
          y="8"
          width="1.5"
          height="1.5"
          rx="0.3"
          fill={primaryColor}
          opacity="0.6"
        />
        <rect
          x="10"
          y="8"
          width="1.5"
          height="1.5"
          rx="0.3"
          fill={primaryColor}
          opacity="0.6"
        />

        {/* Main building windows — row 2 */}
        <rect
          x="7"
          y="12"
          width="1.5"
          height="1.5"
          rx="0.3"
          fill={primaryColor}
          opacity="0.6"
        />
        <rect
          x="10"
          y="12"
          width="1.5"
          height="1.5"
          rx="0.3"
          fill={primaryColor}
          opacity="0.6"
        />

        {/* Wing window */}
        <rect
          x="16"
          y="14"
          width="1.5"
          height="1.5"
          rx="0.3"
          fill={accentColor}
          opacity="0.6"
        />

        {/* Entrance door — accent */}
        <rect
          x="8"
          y="17"
          width="3"
          height="4"
          rx="0.5"
          stroke={accentColor}
          strokeWidth="1"
          fill="none"
        />

        {/* Ground line */}
        <line
          x1="3"
          y1="21"
          x2="21"
          y2="21"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
