import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, polygon } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "";
const POLYGON_AMOY_RPC =
  process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC ||
  "https://rpc-amoy.polygon.technology/";
const POLYGON_MAINNET_RPC =
  process.env.NEXT_PUBLIC_POLYGON_MAINNET_RPC || "https://polygon-rpc.com";

export const web3Config = getDefaultConfig({
  appName: "Client Hub",
  projectId,
  chains: [polygonAmoy, polygon],
  transports: {
    [polygonAmoy.id]: http(POLYGON_AMOY_RPC),
    [polygon.id]: http(POLYGON_MAINNET_RPC),
  },
  ssr: true,
});
