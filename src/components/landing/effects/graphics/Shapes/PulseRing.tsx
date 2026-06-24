import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function PulseRing({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.circle 
        cx="50" cy="50" r="40" 
        fill="none" 
        stroke={`url(#${gradientId})`} 
        strokeWidth="4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.circle 
        cx="50" cy="50" r="25" 
        fill={`url(#${gradientId})`} 
        opacity="0.2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <circle cx="50" cy="50" r="15" fill={`url(#${gradientId})`} />
    </svg>
  );
}
