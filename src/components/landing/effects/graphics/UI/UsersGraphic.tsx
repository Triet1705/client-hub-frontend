import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function UsersGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <circle cx="35" cy="40" r="12" fill={`url(#${gradientId})`} opacity="0.2" />
        <circle cx="35" cy="40" r="12" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M15 80 C15 65 55 65 55 80" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" opacity="0.5" strokeLinecap="round" />
        
        <circle cx="65" cy="50" r="14" fill={`url(#${gradientId})`} opacity="0.8" />
        <circle cx="65" cy="50" r="14" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <path d="M40 90 C40 75 90 75 90 90" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
      </motion.g>
    </svg>
  );
}
