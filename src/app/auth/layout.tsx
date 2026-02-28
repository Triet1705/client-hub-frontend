import { ReactNode } from "react";
import { ClientHubLogo } from "@/components/icons";
import { NetworkStatusBadge } from "@/components/shared/network-status-badge";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background font-space-grotesk text-slate-100 antialiased overflow-hidden">
      {/* TODO: NetworkStatusBadge currently uses hardcoded values.
          Wire up to real wagmi hooks (useAccount, useNetwork) once
          wallet provider is configured at app level. */}
      <NetworkStatusBadge className="fixed top-6 right-6 z-50" />

      <div className="hidden lg:flex flex-1 bg-slate-950 relative items-center justify-center overflow-hidden border-r border-slate-900">
        <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center select-none pointer-events-none">
          <svg
            className="w-[80%] h-[80%]"
            fill="currentColor"
            viewBox="0 0 48 48"
          >
            <path d="M44 4H30.6666V17.3334H17.3334V30.6666H4V44H44V4Z"></path>
          </svg>
        </div>

        <div className="relative z-10 p-12 max-w-lg">
          <div className="flex items-center gap-3 mb-8">
            <ClientHubLogo size="lg" className="text-emerald-500" />
            {/* <h2 className="text-2xl font-bold tracking-tight text-white">
              Client Hub
            </h2> */}
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Verified Gateway to Asset Management.
          </h1>
          <p className="text-slate-400 text-base md:text-lg leading-relaxed">
            The unified interface for workspace tenant validation and
            high-fidelity blockchain security.
          </p>

          <div className="mt-12 flex gap-8">
            <div className="border-l-2 border-emerald-600 pl-4">
              <p className="text-white font-bold text-2xl">100%</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">
                Audit Trail
              </p>
            </div>
            <div className="border-l-2 border-slate-700 pl-4">
              <p className="text-white font-bold text-2xl">Verified</p>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">
                Tenant Logic
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#020617] flex flex-col items-center justify-center p-8 lg:p-24 relative overflow-y-auto">
        <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
          <ClientHubLogo className="h-6 w-6 text-emerald-500" />
          {/* <span className="font-bold text-white uppercase tracking-tighter">
            Client Hub
          </span> */}
        </div>

        {children}
      </div>
    </div>
  );
}
