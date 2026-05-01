import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";

export const wagmiConfig = getDefaultConfig({
  appName: "Solstice",
  appDescription: "Crypto-native fitness class booking. Pay in crypto, earn $SLST tokens.",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "https://solstice.fit",
  appIcon: `${process.env.NEXT_PUBLIC_APP_URL || "https://solstice.fit"}/icon.png`,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "pulse-class-finder",
  chains: [baseSepolia, base],
  ssr: true,
});
