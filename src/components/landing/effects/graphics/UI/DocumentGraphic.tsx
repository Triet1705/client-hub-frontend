import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function DocumentGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.rect 
        x="25" y="15" width="50" height="70" rx="8" 
        fill={`url(#${gradientId})`} opacity="0.2"
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <rect x="25" y="15" width="50" height="70" rx="8" fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" />
      <line x1="35" y1="35" x2="65" y2="35" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
      <line x1="35" y1="50" x2="55" y2="50" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
      <line x1="35" y1="65" x2="65" y2="65" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
