"use client";

import React from "react";

interface FilePdfIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
  alertColor?: string;
}

export function FilePdfIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
  alertColor = "#FF6B35",
}: FilePdfIconProps) {
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
          d="M5 2H13L19 8V21C19 21.5 18.5 22 18 22H5C4.5 22 4 21.5 4 21V3C4 2.5 4.5 2 5 2Z"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <path
          d="M13 2V7C13 7.5 13.5 8 14 8H19"
          stroke={accentColor}
          strokeWidth="1.5"
          fill="none"
        />

        <rect
          x="6"
          y="13"
          width="11"
          height="6"
          rx="1"
          fill={alertColor}
          opacity="0.9"
        />

        <g fill="#FFFFFF">
          <path d="M7.5 15h1v1h-1v2h-0.5v-3.5h1.5c0.3 0 0.5 0.2 0.5 0.5v0.5c0 0.3-0.2 0.5-0.5 0.5h-1v-1z" />
          <path d="M10 15h1c0.5 0 1 0.5 1 1v1.5c0 0.5-0.5 1-1 1h-1v-3.5zm0.5 3h0.5c0.3 0 0.5-0.2 0.5-0.5v-1.5c0-0.3-0.2-0.5-0.5-0.5h-0.5v2.5z" />
          <path d="M13 15h2v0.5h-1.5v1h1v0.5h-1v1.5h-0.5v-3.5z" />
        </g>
      </g>
    </svg>
  );
}
