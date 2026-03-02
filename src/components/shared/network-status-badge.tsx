"use client";

// TODO: Replace hardcoded values with real data from wagmi hooks:
//   - useAccount() for connection status
//   - useChainId() / useNetwork() for chain name & ID
//   - Show "Disconnected" / "Wrong Network" states
//   - Consider adding chain switching prompt on wrong network

interface NetworkStatusBadgeProps {
  className?: string;
}

export function NetworkStatusBadge({ className }: NetworkStatusBadgeProps) {
  // TODO: Wire up to real wallet state
  const isConnected = true; // ← useAccount().isConnected
  const chainName = "Polygon Amoy"; // ← from useNetwork() / chain.name
  const status = isConnected ? "Active" : "Disconnected";

  return (
    <div
      className={`flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-emerald-500/20 px-4 py-3 rounded-lg shadow-2xl ${className ?? ""}`}
    >
      <div className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isConnected ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isConnected ? "bg-emerald-500" : "bg-red-500"
          }`}
        />
      </div>
      <div className="flex flex-col">
        <span
          className={`text-[10px] uppercase tracking-widest font-bold ${
            isConnected ? "text-emerald-400" : "text-red-400"
          }`}
        >
          {isConnected ? "Protocol Ready" : "Disconnected"}
        </span>
        <span className="text-xs text-slate-400">
          {chainName} • {status}
        </span>
      </div>
    </div>
  );
}
