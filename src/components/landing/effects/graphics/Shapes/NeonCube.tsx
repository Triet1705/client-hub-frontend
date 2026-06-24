import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function NeonCube({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.g 
        animate={{ y: [-5, 5, -5] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path d="M50 20 L80 35 L50 50 L20 35 Z" fill={`url(#${gradientId})`} opacity="0.8" />
        <path d="M20 35 L50 50 L50 80 L20 65 Z" fill={`url(#${gradientId})`} opacity="0.4" />
        <path d="M80 35 L50 50 L50 80 L80 65 Z" fill={`url(#${gradientId})`} opacity="0.2" />
        <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" fill="none" stroke={`url(#${gradientId})`} strokeWidth="2" strokeLinejoin="round" />
      </motion.g>
    </svg>
  );
}
