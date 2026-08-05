import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { formatUnits, isAddress, parseUnits } from "viem";

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
  },
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "account", "type": "address" }
    ],
    "name": "balanceOf",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const ESCROW_TOKEN_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_TOKEN_ADDRESS || ZERO_ADDRESS) as `0x${string}`;
export const ESCROW_TOKEN_DECIMALS = Number(process.env.NEXT_PUBLIC_ESCROW_TOKEN_DECIMALS || "6");
export const ESCROW_TOKEN_SYMBOL = "mUSDT";

export function isConfiguredAddress(value: string | undefined | null): value is `0x${string}` {
  return !!value && value !== ZERO_ADDRESS && isAddress(value);
}

type WalletAssetConnector = {
  getProvider: () => Promise<unknown>;
};

type Eip1193Provider = {
  request: (args: {
    method: string;
    params?: unknown;
  }) => Promise<unknown>;
};

export async function addEscrowTokenToWallet(connector?: WalletAssetConnector) {
  if (!connector || !isConfiguredAddress(ESCROW_TOKEN_ADDRESS)) {
    throw new Error("Connect a wallet and configure the escrow token before importing mUSDT.");
  }

  const provider = await connector.getProvider();
  if (
    typeof provider !== "object" ||
    provider === null ||
    !("request" in provider) ||
    typeof (provider as Eip1193Provider).request !== "function"
  ) {
    throw new Error("The connected wallet does not support token import.");
  }

  const accepted = await (provider as Eip1193Provider).request({
    method: "wallet_watchAsset",
    params: {
      type: "ERC20",
      options: {
        address: ESCROW_TOKEN_ADDRESS,
        symbol: ESCROW_TOKEN_SYMBOL,
        decimals: ESCROW_TOKEN_DECIMALS,
      },
    },
  });

  if (accepted === false) {
    throw new Error("The mUSDT import request was declined in the wallet.");
  }
}

function requireExpectedSigner(
  connectedAddress: string | undefined,
  expectedSigner: string | undefined | null,
): `0x${string}` {
  if (!isConfiguredAddress(expectedSigner)) {
    throw new Error("The bound client wallet is missing or invalid.");
  }
  if (!connectedAddress || connectedAddress.toLowerCase() !== expectedSigner.toLowerCase()) {
    throw new Error("The connected wallet does not match the bound client wallet.");
  }
  return expectedSigner;
}

export function useEscrowContract(expectedSigner?: string | null) {
  const { address: connectedAddress } = useAccount();
  const publicClient = usePublicClient();
  const depositMutation = useWriteContract();
  const releaseMutation = useWriteContract();
  const approveMutation = useWriteContract();

  const depositReceipt = useWaitForTransactionReceipt({ hash: depositMutation.data });
  const releaseReceipt = useWaitForTransactionReceipt({ hash: releaseMutation.data });
  const approveReceipt = useWaitForTransactionReceipt({ hash: approveMutation.data });

  const readTokenBalance = async (
    tokenAddress: `0x${string}`,
    account: `0x${string}`,
  ) => {
    if (!publicClient) {
      throw new Error("The blockchain client is not ready.");
    }
    return publicClient.readContract({
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account],
    });
  };

  const deposit = async (invoiceId: number, tokenAddress: string, amount: string | number, freelancer: string, decimals: number = 6) => {
    try {
      const account = requireExpectedSigner(connectedAddress, expectedSigner);
      if (!publicClient) {
        throw new Error("The blockchain client is not ready.");
      }
      if (!isConfiguredAddress(tokenAddress) || !isConfiguredAddress(freelancer)) {
        throw new Error("The escrow token or freelancer wallet is invalid.");
      }
      const parsedAmount = parseUnits(String(amount), decimals);
      const clientBalanceBefore = await readTokenBalance(tokenAddress, account);
      const escrowBalanceBefore = await readTokenBalance(tokenAddress, ESCROW_ADDRESS);
      const hash = await depositMutation.writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "deposit",
        args: [BigInt(invoiceId), tokenAddress, parsedAmount, freelancer],
        account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("The escrow deposit transaction failed on-chain.");
      }
      if (receipt.from.toLowerCase() !== account.toLowerCase()) {
        throw new Error("The deposit was sent by a wallet other than the bound client wallet.");
      }
      const clientBalanceAfter = await readTokenBalance(tokenAddress, account);
      const escrowBalanceAfter = await readTokenBalance(tokenAddress, ESCROW_ADDRESS);
      const clientDelta = clientBalanceBefore - clientBalanceAfter;
      const escrowDelta = escrowBalanceAfter - escrowBalanceBefore;
      if (clientDelta !== parsedAmount || escrowDelta !== parsedAmount) {
        throw new Error("Deposit mined, but the expected mUSDT balance transfer was not observed.");
      }
      return { hash, clientDelta, escrowDelta };
    } catch (error) {
      console.error("Deposit error:", error);
      throw error;
    }
  };

  const release = async (
    invoiceId: number,
    tokenAddress: string,
    amount: string | number,
    freelancer: string,
    decimals: number = 6,
  ) => {
    try {
      const account = requireExpectedSigner(connectedAddress, expectedSigner);
      if (!publicClient) {
        throw new Error("The blockchain client is not ready.");
      }
      if (!isConfiguredAddress(tokenAddress) || !isConfiguredAddress(freelancer)) {
        throw new Error("The escrow token or freelancer wallet is invalid.");
      }
      const parsedAmount = parseUnits(String(amount), decimals);
      const escrowBalanceBefore = await readTokenBalance(tokenAddress, ESCROW_ADDRESS);
      const freelancerBalanceBefore = await readTokenBalance(tokenAddress, freelancer);
      const hash = await releaseMutation.writeContractAsync({
        address: ESCROW_ADDRESS,
        abi: ESCROW_ABI,
        functionName: "release",
        args: [BigInt(invoiceId)],
        account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("The escrow release transaction failed on-chain.");
      }
      if (receipt.from.toLowerCase() !== account.toLowerCase()) {
        throw new Error("The release was sent by a wallet other than the bound client wallet.");
      }
      const escrowBalanceAfter = await readTokenBalance(tokenAddress, ESCROW_ADDRESS);
      const freelancerBalanceAfter = await readTokenBalance(tokenAddress, freelancer);
      const escrowDelta = escrowBalanceBefore - escrowBalanceAfter;
      const freelancerDelta = freelancerBalanceAfter - freelancerBalanceBefore;
      if (escrowDelta !== parsedAmount || freelancerDelta !== parsedAmount) {
        throw new Error("Release mined, but the expected freelancer mUSDT balance transfer was not observed.");
      }
      return { hash, escrowDelta, freelancerDelta };
    } catch (error) {
      console.error("Release error:", error);
      throw error;
    }
  };

  const approve = async (tokenAddress: string, amount: string | number, decimals: number = 6) => {
    try {
      const account = requireExpectedSigner(connectedAddress, expectedSigner);
      if (!publicClient) {
        throw new Error("The blockchain client is not ready.");
      }
      const parsedAmount = parseUnits(String(amount), decimals);
      const hash = await approveMutation.writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [ESCROW_ADDRESS, parsedAmount],
        account,
      });
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") {
        throw new Error("The token approval transaction failed on-chain.");
      }
      if (receipt.from.toLowerCase() !== account.toLowerCase()) {
        throw new Error("The approval was sent by a wallet other than the bound client wallet.");
      }
      return hash;
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

export function useTokenAllowance(owner: `0x${string}` | undefined, amount: string | number, isSupportedChain: boolean, decimals: number = 6) {
  const { data, refetch, isLoading, error } = useReadContract({
    address: ESCROW_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: owner ? [owner, ESCROW_ADDRESS] : undefined,
    query: {
      enabled:
        !!owner &&
        isSupportedChain &&
        isConfiguredAddress(ESCROW_ADDRESS) &&
        isConfiguredAddress(ESCROW_TOKEN_ADDRESS),
      retry: false,
    },
  });

  const parsedAmount = amount ? parseUnits(String(amount), decimals) : BigInt(0);
  const hasAllowance = data !== undefined && (data as bigint) >= parsedAmount;

  return {
    hasAllowance,
    refetchAllowance: refetch,
    isLoadingAllowance: isLoading,
    allowanceError: error,
  };
}

export function useEscrowTokenBalance(
  owner: `0x${string}` | undefined,
  isSupportedChain: boolean,
) {
  const query = useReadContract({
    address: ESCROW_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: owner ? [owner] : undefined,
    query: {
      enabled:
        !!owner &&
        isSupportedChain &&
        isConfiguredAddress(ESCROW_TOKEN_ADDRESS),
      retry: false,
    },
  });

  return {
    ...query,
    formattedBalance:
      query.data === undefined
        ? null
        : formatUnits(query.data as bigint, ESCROW_TOKEN_DECIMALS),
  };
}
