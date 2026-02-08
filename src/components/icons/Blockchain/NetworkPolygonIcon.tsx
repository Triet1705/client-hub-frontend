"use client";

import React from "react";

interface NetworkPolygonIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
  polygonPurple?: string; // Polygon brand color
}

export function NetworkPolygonIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
  polygonPurple = "#8247E5", // Official Polygon color
}: NetworkPolygonIconProps) {
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
        {/* Main Polygon shape - distinctive polygon outline */}
        <path
          d="M12 3L19 7L19 13L12 17L5 13L5 7Z"
          fill="none"
          stroke={polygonPurple}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M12 5L17 8L17 12L12 15L7 12L7 8Z"
          fill={polygonPurple}
          opacity="0.15"
        />

        <circle cx="12" cy="3" r="1.8" fill={polygonPurple} />
        <circle cx="19" cy="7" r="1.8" fill={accentColor} />
        <circle cx="19" cy="13" r="1.8" fill={accentColor} />
        <circle cx="12" cy="17" r="1.8" fill={polygonPurple} />
        <circle cx="5" cy="13" r="1.8" fill={accentColor} />
        <circle cx="5" cy="7" r="1.8" fill={accentColor} />

        <circle cx="12" cy="10" r="2.5" fill={polygonPurple} opacity="0.9" />
        <circle cx="12" cy="10" r="1.2" fill="#FFFFFF" opacity="0.9" />

        <line
          x1="12"
          y1="10"
          x2="12"
          y2="3"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="12"
          y1="10"
          x2="19"
          y2="7"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="12"
          y1="10"
          x2="19"
          y2="13"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="12"
          y1="10"
          x2="12"
          y2="17"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="12"
          y1="10"
          x2="5"
          y2="13"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />
        <line
          x1="12"
          y1="10"
          x2="5"
          y2="7"
          stroke={accentColor}
          strokeWidth="0.8"
          opacity="0.5"
        />

        <path
          d="M11 20L12 21L13 20"
          stroke={polygonPurple}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
