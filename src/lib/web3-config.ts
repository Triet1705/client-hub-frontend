import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { polygonAmoy, hardhat } from "wagmi/chains";
import { http } from "wagmi";

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || "YOUR_PROJECT_ID";
const POLYGON_AMOY_RPC =
  process.env.NEXT_PUBLIC_POLYGON_AMOY_RPC ||
  "https://rpc-amoy.polygon.technology/";

export const web3Config = getDefaultConfig({
  appName: "Client Hub",
  projectId,
  chains: [hardhat, polygonAmoy],
  transports: {
    [hardhat.id]: http(),
    [polygonAmoy.id]: http(POLYGON_AMOY_RPC),
  },
  ssr: true,
});
