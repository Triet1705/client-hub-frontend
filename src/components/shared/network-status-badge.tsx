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
      className={`flex items-center gap-3 bg-surface/80 backdrop-blur-md border px-4 py-3 rounded-lg shadow-2xl ${
        status === "READY" ? "border-theme-accent" :
        status === "WRONG_NETWORK" ? "border-status-warning-border" :
        "border-status-danger-border"
      } ${className ?? ""}`}
    >
      <div className="relative flex h-2 w-2">
        {status !== "DISCONNECTED" && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === "READY" ? "bg-status-success-text" : "bg-status-warning-text"
            }`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status === "READY" ? "bg-status-success-text" :
            status === "WRONG_NETWORK" ? "bg-status-warning-text" :
            "bg-status-danger-text"
          }`}
        />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center justify-between gap-4">
          <span
            className={`text-[10px] uppercase tracking-widest font-bold ${
              status === "READY" ? "text-theme-accent" :
              status === "WRONG_NETWORK" ? "text-status-warning-text" :
              "text-status-danger-text"
            }`}
          >
            {status === "READY" ? "Protocol Ready" :
             status === "WRONG_NETWORK" ? "Wrong Network" :
             "Disconnected"}
          </span>

          {status === "WRONG_NETWORK" && (
            <button
              onClick={handleSwitch}
              className="text-[10px] bg-status-warning-surface text-status-warning-text px-2 py-0.5 rounded hover:bg-status-warning-surface transition-colors"
            >
              Switch
            </button>
          )}
        </div>
        <span className="text-xs text-content-secondary">
          {status === "DISCONNECTED" ? "No wallet" :
           status === "WRONG_NETWORK" ? `Please switch to ${chainName}` :
           `${chainName} • Active`}
        </span>
      </div>
    </div>
  );
}
