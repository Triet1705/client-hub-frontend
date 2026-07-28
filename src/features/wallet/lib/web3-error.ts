type Web3LikeError = Error & {
  name?: string;
  shortMessage?: string;
};

export function getWeb3ErrorMessage(error: unknown): string {
  const candidate = error as Web3LikeError;
  const raw = `${candidate?.shortMessage ?? ""} ${candidate?.message ?? ""}`.toLowerCase();

  if (
    candidate?.name === "UserRejectedRequestError" ||
    raw.includes("user rejected") ||
    raw.includes("user denied")
  ) {
    return "Transaction cancelled in your wallet.";
  }
  if (raw.includes("returned no data") || raw.includes("internal error")) {
    return "Local blockchain contracts are unavailable or out of sync. Run the local bootstrap and restart the app.";
  }
  if (raw.includes("already deposited")) {
    return "This invoice is already deposited on-chain. Wait for backend synchronization.";
  }
  if (raw.includes("connector not connected")) {
    return "Connect your wallet and try again.";
  }
  if (
    raw.includes("bound client wallet") ||
    raw.includes("wallet other than")
  ) {
    return "Connect the wallet bound to this Client Hub client account before continuing.";
  }

  return candidate?.shortMessage
    ? candidate.shortMessage.slice(0, 160)
    : "The blockchain transaction could not be completed.";
}
