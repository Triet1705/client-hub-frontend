"use client";

import React from "react";

interface UploadCloudIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
}

export function UploadCloudIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
}: UploadCloudIconProps) {
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
          d="M5 14 Q3 14 3 12 Q3 10 5 10 Q6 7 9 7 Q12 7 13 10 Q15 10 15 12 Q15 14 13 14"
          fill="none"
          stroke={primaryColor}
          strokeWidth="1.5"
        />

        <path
          d="M9 12 L9 15"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M7 13 L9 11 L11 13"
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <circle cx="6" cy="17" r="0.8" fill={primaryColor} opacity="0.6" />
        <circle cx="9" cy="18" r="0.8" fill={accentColor} opacity="0.7" />
        <circle cx="12" cy="17" r="0.8" fill={primaryColor} opacity="0.5" />
      </g>
    </svg>
  );
}
