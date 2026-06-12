"use client";

import { useAccount, useChainId, useChains, useSwitchChain } from "wagmi";

interface NetworkStatusBadgeProps {
  className?: string;
}

export function NetworkStatusBadge({ className }: NetworkStatusBadgeProps) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const chains = useChains();
  const { switchChain } = useSwitchChain();

  const currentChain = chains.find((c) => c.id === chainId);
  const isWrongNetwork = isConnected && !currentChain;
  
  // The configured target chain (fallback to Polygon Amoy if multiple)
  const targetChain = chains[0];
  const chainName = currentChain ? currentChain.name : (targetChain?.name || "Polygon Amoy");

  let status: "READY" | "WRONG_NETWORK" | "DISCONNECTED";
  if (!isConnected) {
    status = "DISCONNECTED";
  } else if (isWrongNetwork) {
    status = "WRONG_NETWORK";
  } else {
    status = "READY";
  }

  const handleSwitch = () => {
    if (targetChain && switchChain) {
      switchChain({ chainId: targetChain.id });
    }
  };

  return (
    <div
      className={`flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border px-4 py-3 rounded-lg shadow-2xl ${
        status === "READY" ? "border-emerald-500/20" :
        status === "WRONG_NETWORK" ? "border-amber-500/20" :
        "border-red-500/20"
      } ${className ?? ""}`}
    >
      <div className="relative flex h-2 w-2">
        {status !== "DISCONNECTED" && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === "READY" ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === "READY" ? "bg-emerald-500" :
            status === "WRONG_NETWORK" ? "bg-amber-500" :
            "bg-red-500"
          }`}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <span
            className={`text-[10px] uppercase tracking-widest font-bold ${
              status === "READY" ? "text-emerald-400" :
              status === "WRONG_NETWORK" ? "text-amber-400" :
              "text-red-400"
            }`}
          >
            {status === "READY" ? "Protocol Ready" :
             status === "WRONG_NETWORK" ? "Wrong Network" :
             "Disconnected"}
          </span>
          
          {status === "WRONG_NETWORK" && (
            <button
              onClick={handleSwitch}
              className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded hover:bg-amber-500/30 transition-colors"
            >
              Switch
            </button>
          )}
        </div>
        <span className="text-xs text-slate-400">
          {status === "DISCONNECTED" ? "No wallet" :
           status === "WRONG_NETWORK" ? `Please switch to ${chainName}` :
           `${chainName} • Active`}
        </span>
      </div>
    </div>
  );
}
