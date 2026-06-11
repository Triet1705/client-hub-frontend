import { useWriteContract, useReadContract, useWaitForTransactionReceipt } from "wagmi";
import { isAddress, parseUnits } from "viem";

import contractAbis from "@/lib/contracts/abi.json";

export const ESCROW_ABI = contractAbis.FreelanceEscrow;

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

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const ESCROW_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_TOKEN_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const ESCROW_TOKEN_DECIMALS = Number(process.env.NEXT_PUBLIC_ESCROW_TOKEN_DECIMALS || "6");

export function isConfiguredAddress(value: string | undefined | null): value is `0x${string}` {
  return !!value && value !== ZERO_ADDRESS && isAddress(value);
}

export function useEscrowContract() {
  const depositMutation = useWriteContract();
  const releaseMutation = useWriteContract();
  const approveMutation = useWriteContract();

  const depositReceipt = useWaitForTransactionReceipt({ hash: depositMutation.data });
  const releaseReceipt = useWaitForTransactionReceipt({ hash: releaseMutation.data });
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveMutation.data });

  const deposit = async (invoiceId: number, tokenAddress: string, amount: string | number, freelancer: string, decimals: number = 6) => {
    try {
      const parsedAmount = parseUnits(String(amount), decimals);
      return await depositMutation.writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "deposit",
        args: [BigInt(invoiceId), tokenAddress as `0x${string}`, parsedAmount, freelancer as `0x${string}`],
      });
    } catch (error) {
      console.error("Deposit error:", error);
      throw error;
    }
  };

  const release = async (invoiceId: number) => {
    try {
      return await releaseMutation.writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "release",
        args: [BigInt(invoiceId)],
      });
    } catch (error) {
      console.error("Release error:", error);
      throw error;
    }
  };

  const approve = async (tokenAddress: string, amount: string | number, decimals: number = 6) => {
    try {
      const parsedAmount = parseUnits(String(amount), decimals);
      return await approveMutation.writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ESCROW_ADDRESS, parsedAmount],
      });
    } catch (error) {
      console.error("Approve error:", error);
      throw error;
    }
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
