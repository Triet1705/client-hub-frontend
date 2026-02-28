"use client";

import React, { useState, useEffect } from "react";
import { InvoiceStatusBadge } from "@/components/shared/InvoiceStatusBadge";
import { InvoiceStatus } from "@/lib/type";

/**
 * DynamicConfirmationDemo - Example showing how confirmations update in real-time
 *
 * Usage in real app:
 * 1. Backend sends WebSocket updates: { status: "DEPOSIT_DETECTED", confirmations: X }
 * 2. Frontend updates state → re-renders badge with new confirmation count
 * 3. Icon visual changes automatically (sand level, nodes, text)
 * 4. At 12 confirmations → backend changes status to LOCKED → icon switches to CryptographicLockIcon
 */
export function DynamicConfirmationDemo() {
  const [confirmations, setConfirmations] = useState(1);
  const [status, setStatus] = useState<InvoiceStatus>(
    InvoiceStatus.DEPOSIT_DETECTED,
  );
  const [isSimulating, setIsSimulating] = useState(false);

  // Simulate blockchain confirmation progression
  const simulateBlockchainProgress = () => {
    setConfirmations(1);
    setStatus(InvoiceStatus.DEPOSIT_DETECTED);
    setIsSimulating(true);
  };

  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setConfirmations((prev) => {
        if (prev >= 11) {
          // At 12 confirmations, backend would update status to LOCKED
          setTimeout(() => {
            setStatus(InvoiceStatus.LOCKED);
            setIsSimulating(false);
          }, 500);
          return 12;
        }
        return prev + 1;
      });
    }, 1500); // 1.5s per confirmation (simulating ~15s block time)

    return () => clearInterval(interval);
  }, [isSimulating]);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-amber-50 to-blue-50 rounded-xl border-2 border-amber-300">
      <h3 className="text-xl font-bold text-amber-900 mb-4 text-center">
        ⛓️ Live Blockchain Confirmation Simulation
      </h3>

      {/* Current Status Badge */}
      <div className="flex justify-center mb-6">
        <InvoiceStatusBadge
          status={status}
          confirmations={confirmations}
          size="lg"
        />
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-amber-800 mb-2">
          <span>Confirmations: {confirmations}/12</span>
          <span>{Math.round((confirmations / 12) * 100)}% complete</span>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-blue-500 transition-all duration-500"
            style={{ width: `${(confirmations / 12) * 100}%` }}
          />
        </div>
      </div>

      {/* Status Info */}
      <div className="bg-white p-4 rounded-lg border border-amber-300 mb-4">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Status:</span>
            <span className="ml-2 font-mono text-blue-600">{status}</span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Confirmations:</span>
            <span className="ml-2 font-mono text-amber-600">
              {confirmations}/12
            </span>
          </div>
          <div className="col-span-2">
            <span className="font-semibold text-gray-700">Visual Changes:</span>
            <ul className="ml-4 mt-1 text-xs text-gray-600 space-y-1">
              <li>✓ Text updates: `{confirmations}/12`</li>
              <li>
                ✓ Sand level:{" "}
                {confirmations < 6
                  ? "High"
                  : confirmations < 10
                    ? "Medium"
                    : "Low"}{" "}
                in top chamber
              </li>
              <li>✓ Node 1: Always lit (1st confirmation)</li>
              <li>
                ✓ Node 2: {confirmations >= 4 ? "🟢 Lit" : "⚪ Dark"} (lights at
                4 conf)
              </li>
              <li>
                ✓ Node 3: {confirmations >= 8 ? "🟢 Lit" : "⚪ Dark"} (lights at
                8 conf)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Control Button */}
      <button
        onClick={simulateBlockchainProgress}
        disabled={isSimulating}
        className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
          isSimulating
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg hover:shadow-xl"
        }`}
      >
        {isSimulating
          ? `⏳ Confirming... (${confirmations}/12)`
          : "▶️ Start Simulation"}
      </button>

      {/* Info Footer */}
      <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-300 text-xs text-blue-800">
        <strong>💡 Real Implementation:</strong>
        <p className="mt-1">
          Backend sends WebSocket updates with{" "}
          <code className="bg-blue-100 px-1 rounded">confirmations</code> count.
          At 12 confirmations, status changes to{" "}
          <code className="bg-blue-100 px-1 rounded">LOCKED</code>→ icon
          switches to CryptographicLockIcon automatically.
        </p>
      </div>
    </div>
  );
}
