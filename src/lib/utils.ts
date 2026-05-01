import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatTime = (time: string) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString([], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatPrice = (cents: number) => (cents / 100).toFixed(2);

// 1 ETH ≈ $3000 (fixed rate for demo — swap for live price feed when ready)
const ETH_USD_RATE = 3000n;

export function priceCentsToWei(priceCents: number): bigint {
  if (priceCents === 0) return 0n;
  return (BigInt(priceCents) * 10n ** 18n) / (100n * ETH_USD_RATE);
}

export function priceWeiToEth(wei: bigint): string {
  const eth = Number(wei) / 1e18;
  return eth.toFixed(5);
}