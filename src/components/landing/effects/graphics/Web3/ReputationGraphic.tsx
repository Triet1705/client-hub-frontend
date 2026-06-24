import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function ReputationGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g animate={{ y: [-3, 3, -3] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
        <path d="M35 55 L35 90 L50 80 L65 90 L65 55" fill={`url(#${gradientId})`} opacity="0.4" />
        <path d="M35 55 L35 90 L50 80 L65 90 L65 55" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinejoin="round" />
        <circle cx="50" cy="40" r="25" fill="#020617" stroke={`url(#${gradientId})`} strokeWidth="3" />
        <circle cx="50" cy="40" r="18" fill={`url(#${gradientId})`} opacity="0.2" />
        <path d="M50 28 L53 35 L60 36 L55 42 L56 49 L50 46 L44 49 L45 42 L40 36 L47 35 Z" fill={`url(#${gradientId})`} opacity="0.8" />
      </motion.g>
    </svg>
  );
}
