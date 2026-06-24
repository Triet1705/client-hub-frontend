import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function ChatGraphic({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} />
        </linearGradient>
      </defs>
      <motion.path 
        d="M80 30 C80 13 67 10 50 10 C33 10 20 13 20 30 C20 47 33 50 50 50 L65 60 L65 50 C75 48 80 40 80 30 Z" 
        fill={`url(#${gradientId})`} opacity="0.3"
        animate={{ y: [-3, 3, -3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <path 
        d="M80 30 C80 13 67 10 50 10 C33 10 20 13 20 30 C20 47 33 50 50 50 L65 60 L65 50 C75 48 80 40 80 30 Z" 
        fill="none" stroke={`url(#${gradientId})`} strokeWidth="3" strokeLinejoin="round" 
      />
      <motion.path 
        d="M70 65 C70 80 57 85 40 85 L25 95 L25 85 C15 82 10 75 10 65 C10 50 23 45 40 45 C57 45 70 50 70 65 Z" 
        fill={`url(#${gradientId})`} opacity="0.8"
        animate={{ y: [3, -3, 3] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />
    </svg>
  );
}
