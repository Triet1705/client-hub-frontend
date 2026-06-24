"use client";

import { useReducedMotion } from "framer-motion";
import ColorBends from "./ColorBends";

export function ColorBendsBg() {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 bg-[#020617]" />
    );
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-100 z-0 mix-blend-screen">
      <ColorBends
        colors={["#10b77f", "#0ea5e9", "#8a5cff"]}
        rotation={90}
        speed={0.2}
        scale={1.2}
        frequency={1}
        warpStrength={1}
        mouseInfluence={0.5}
        noise={0.15}
        parallax={0.5}
        iterations={1}
        intensity={1.8}
        bandWidth={6}
        transparent={true}
      />
    </div>
  );
}
