import { ReactNode } from "react";
import { NetworkStatusBadge } from "@/components/shared/network-status-badge";
import ColorBends from "@/components/animations/ColorBends";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background font-space-grotesk text-slate-100 antialiased overflow-hidden">

      <NetworkStatusBadge className="fixed top-6 right-6 z-50" />

      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden border-r border-slate-900 bg-slate-950">
        <div className="absolute inset-0 z-0">
          <ColorBends
            colors={["#00ffd1", "#10b981", "#059669"]}
            rotation={75}
            speed={0.3}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={1}
            noise={0.1}
            parallax={1.05}
            iterations={2}
            intensity={1.6}
            bandWidth={2.5}
            transparent
            autoRotate={2}
          />
        </div>
      </div>

      <div className="flex-1 bg-[#020617] flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-8 left-8 flex items-center z-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {children}
      </div>
    </div>
  );
}
