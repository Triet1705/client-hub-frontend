import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function LockGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor={c.from} />
        <stop offset="100%" stopColor={c.to} />
      </linearGradient>
    </defs>
    <path d="M30 45 L70 45 L70 85 L30 85 Z" fill={`url(#${gradientId})`} opacity="0.8" rx="8" />
    <motion.path 
      d="M35 45 L35 30 C35 20 65 20 65 30 L65 45" 
      fill="none" stroke={`url(#${gradientId})`} strokeWidth="4" strokeLinecap="round"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    />
    <circle cx="50" cy="65" r="5" fill="#ffffff" opacity="0.9" />
  </svg>
  );
}
