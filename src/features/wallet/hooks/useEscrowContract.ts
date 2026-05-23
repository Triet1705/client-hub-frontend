import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { parseUnits } from "viem";

// Placeholder ABI for compilation until Phase 1 is done
export const ESCROW_ABI = [
  {
    "inputs": [
      { "internalType": "uint256", "name": "invoiceId", "type": "uint256" },
      { "internalType": "address", "name": "token", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "deposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "invoiceId", "type": "uint256" }
    ],
    "name": "release",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "invoiceId", "type": "uint256" }
    ],
    "name": "getEscrowStatus",
    "outputs": [
      { "internalType": "uint8", "name": "", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [
      { "internalType": "bool", "name": "", "type": "bool" }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

export function useEscrowContract() {
  const depositMutation = useWriteContract();
  const releaseMutation = useWriteContract();
  const approveMutation = useWriteContract();

  const depositReceipt = useWaitForTransactionReceipt({ hash: depositMutation.data });
  const releaseReceipt = useWaitForTransactionReceipt({ hash: releaseMutation.data });
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveMutation.data });

  const deposit = async (invoiceId: number, tokenAddress: string, amount: string, decimals: number = 6) => {
    const parsedAmount = parseUnits(amount, decimals);
    depositMutation.writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "deposit",
      args: [BigInt(invoiceId), tokenAddress as `0x${string}`, parsedAmount],
    });
  };

  const release = async (invoiceId: number) => {
    releaseMutation.writeContract({
      address: ESCROW_ADDRESS,
      abi: ESCROW_ABI,
      functionName: "release",
      args: [BigInt(invoiceId)],
    });
  };

  const approve = async (tokenAddress: string, amount: string, decimals: number = 6) => {
    const parsedAmount = parseUnits(amount, decimals);
    approveMutation.writeContract({
      address: tokenAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [ESCROW_ADDRESS, parsedAmount],
    });
  };

  return {
    deposit,
    isDepositing: depositMutation.isPending || depositReceipt.isLoading,
    isDepositSuccess: depositReceipt.isSuccess,
    depositError: depositMutation.error,
    depositHash: depositMutation.data,

    release,
    isReleasing: releaseMutation.isPending || releaseReceipt.isLoading,
    isReleaseSuccess: releaseReceipt.isSuccess,
    releaseError: releaseMutation.error,
    releaseHash: releaseMutation.data,

    approve,
    isApproving: approveMutation.isPending || approveReceipt.isLoading,
    isApproveSuccess: approveReceipt.isSuccess,
    approveError: approveMutation.error,
    approveHash: approveMutation.data,
  };
}

export function useEscrowStatus(invoiceId: number) {
  return useReadContract({
    address: ESCROW_ADDRESS,
    abi: ESCROW_ABI,
    functionName: "getEscrowStatus",
    args: [BigInt(invoiceId)],
  });
}
