import React from "react";
import { motion } from "framer-motion";
import { GraphicShapeProps } from "../types";

export function MeshSphere({ gradientId, colorConfig: c }: GraphicShapeProps) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id={gradientId} cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor={c.from} />
          <stop offset="100%" stopColor={c.to} stopOpacity="0.2" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="45" fill={`url(#${gradientId})`} />
      <motion.path 
        d="M5 50 Q50 0 95 50 Q50 100 5 50 Z" 
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"
        animate={{ rotate: [0, 180, 360] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
      <motion.path 
        d="M50 5 Q100 50 50 95 Q0 50 50 5 Z" 
        fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"
        animate={{ rotate: [0, -180, -360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "center" }}
      />
    </svg>
  );
}
