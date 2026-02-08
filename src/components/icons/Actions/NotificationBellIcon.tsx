"use client";

import React from "react";

interface NotificationBellIconProps {
  className?: string;
  isActive?: boolean;
  primaryColor?: string;
  accentColor?: string;
  alertColor?: string;
  hasNotifications?: boolean;
  notificationCount?: number;
}

export function NotificationBellIcon({
  className = "w-6 h-6",
  isActive = false,
  primaryColor = "#0052CC",
  accentColor = "#00D9A3",
  alertColor = "#FF4444",
  hasNotifications = false,
  notificationCount,
}: NotificationBellIconProps) {
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
        {/* Bell top handle */}
        <line
          x1="12"
          y1="3"
          x2="12"
          y2="5"
          stroke={primaryColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Bell body - improved symmetric shape */}
        <path
          d="M8 7C8 5.3 9.8 4 12 4C14.2 4 16 5.3 16 7V11C16 13.5 17 15 18 15H6C7 15 8 13.5 8 11V7Z"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Bell bottom rim */}
        <path
          d="M6 15C6 15 7 16 12 16C17 16 18 15 18 15"
          stroke={primaryColor}
          strokeWidth="1.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Bell clapper (sound indicator) */}
        <line
          x1="12"
          y1="16"
          x2="12"
          y2="17"
          stroke={accentColor}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="12" cy="18" r="1" fill={accentColor} />

        {/* Sound waves */}
        <path
          d="M7 8C6 8 5 7 5 6"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M17 8C18 8 19 7 19 6"
          stroke={accentColor}
          strokeWidth="1"
          opacity="0.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Notification badge - only show when hasNotifications is true */}
        {hasNotifications && (
          <>
            <circle cx="17" cy="5" r="3.2" fill={alertColor} />
            <circle
              cx="17"
              cy="5"
              r="3.2"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
            {notificationCount && notificationCount < 10 ? (
              <text
                x="17"
                y="6.5"
                textAnchor="middle"
                fontSize="4.5"
                fontWeight="bold"
                fill="#FFFFFF"
              >
                {notificationCount}
              </text>
            ) : notificationCount && notificationCount >= 10 ? (
              <text
                x="17"
                y="6.5"
                textAnchor="middle"
                fontSize="3.5"
                fontWeight="bold"
                fill="#FFFFFF"
              >
                9+
              </text>
            ) : (
              <circle cx="17" cy="5" r="1.2" fill="#FFFFFF" />
            )}
          </>
        )}
      </g>
    </svg>
  );
}
