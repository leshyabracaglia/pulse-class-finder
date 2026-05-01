import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import LandingPage from "@/views/Landing";

export const metadata: Metadata = {
  title: "Solstice — Crypto-Native Fitness Class Booking",
  description:
    "Discover and book fitness classes from top studios. Pay in crypto on Base Network and earn $SLST tokens for every session you complete. Instant studio settlements.",
  keywords: [
    "fitness classes",
    "crypto fitness",
    "book fitness classes",
    "web3 fitness",
    "Base Network fitness",
    "crypto gym booking",
    "on-chain fitness",
    "earn crypto working out",
  ],
  openGraph: {
    title: "Solstice — Crypto-Native Fitness",
    description:
      "Book fitness classes from top studios. Pay in crypto. Earn $SLST tokens for every session you complete.",
    type: "website",
    siteName: "Solstice",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solstice — Crypto-Native Fitness",
    description:
      "Book fitness classes from top studios. Pay in crypto. Earn $SLST tokens for every session you complete.",
  },
};

export default async function RootPage() {
  const session = await auth();
  if (session) {
    redirect("/home");
  }
  return <LandingPage />;
}
