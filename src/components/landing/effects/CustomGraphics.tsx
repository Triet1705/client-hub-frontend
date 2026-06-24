import React, { useId } from "react";
import * as Graphics from "./graphics";

export type GraphicColor = "emerald" | "blue" | "purple" | "amber" | "rose" | "orange" | "indigo";

interface CustomGraphicProps {
  type: "pulseRing" | "neonCube" | "glowingShield" | "gradientHexagon" | "meshSphere" | "sparkles" | "infinity" | "lock" | "document" | "chat" | "workspace" | "billing" | "vault" | "escrow" | "audit" | "reputation" | "users" | "alert";
  color?: GraphicColor;
  className?: string;
  size?: number;
}

const colorMap = {
  emerald: { from: "#10b77f", to: "#059669", glow: "rgba(16, 185, 129, 0.4)" },
  blue: { from: "#3b82f6", to: "#1d4ed8", glow: "rgba(59, 130, 246, 0.4)" },
  purple: { from: "#8b5cf6", to: "#6d28d9", glow: "rgba(139, 92, 246, 0.4)" },
  amber: { from: "#f59e0b", to: "#b45309", glow: "rgba(245, 158, 11, 0.4)" },
  rose: { from: "#f43f5e", to: "#be123c", glow: "rgba(244, 63, 94, 0.4)" },
  orange: { from: "#f97316", to: "#c2410c", glow: "rgba(249, 115, 22, 0.4)" },
  indigo: { from: "#6366f1", to: "#4338ca", glow: "rgba(99, 102, 241, 0.4)" },
};

export function CustomGraphic({ type, color = "emerald", className = "", size = 64 }: CustomGraphicProps) {
  const gradientId = useId();
  const c = colorMap[color];
  const props = { gradientId, colorConfig: c };

  const renderShape = () => {
    switch (type) {
      case "pulseRing": return <Graphics.PulseRing {...props} />;
      case "gradientHexagon": return <Graphics.GradientHexagon {...props} />;
      case "meshSphere": return <Graphics.MeshSphere {...props} />;
      case "document": return <Graphics.DocumentGraphic {...props} />;
      case "chat": return <Graphics.ChatGraphic {...props} />;
      case "lock": return <Graphics.LockGraphic {...props} />;
      case "alert": return <Graphics.AlertGraphic {...props} />;
      case "workspace": return <Graphics.WorkspaceGraphic {...props} />;
      case "users": return <Graphics.UsersGraphic {...props} />;
      case "billing": return <Graphics.BillingGraphic {...props} />;
      case "vault": return <Graphics.VaultGraphic {...props} />;
      case "escrow": return <Graphics.EscrowGraphic {...props} />;
      case "audit": return <Graphics.AuditGraphic {...props} />;
      case "reputation": return <Graphics.ReputationGraphic {...props} />;
      case "neonCube":
      default:
        return <Graphics.NeonCube {...props} />;
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0 blur-xl rounded-full opacity-60 mix-blend-screen" 
        style={{ background: c.glow }}
      />
      <div className="relative z-10 w-full h-full">
        {renderShape()}
      </div>
    </div>
  );
}
