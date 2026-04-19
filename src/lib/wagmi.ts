import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Pulse Class Finder",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "pulse-class-finder",
  chains: [baseSepolia, base],
  ssr: true,
});
