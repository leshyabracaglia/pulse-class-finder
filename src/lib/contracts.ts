import { keccak256, toBytes } from "viem";

export const BOOKING_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_BOOKING_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

export const PACKAGES_CONTRACT_ADDRESS = (
  process.env.NEXT_PUBLIC_PACKAGES_CONTRACT_ADDRESS || "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

/** Convert a string class ID (UUID) to bytes32 for the contract */
export function classIdToBytes32(classId: string): `0x${string}` {
  return keccak256(toBytes(classId));
}

/** Convert a string package ID to bytes32 for the contract */
export function packageIdToBytes32(packageId: string): `0x${string}` {
  return keccak256(toBytes(packageId));
}

export const PULSE_BOOKING_ABI = [
  {
    name: "registerClass",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "classId", type: "bytes32" },
      { name: "maxCapacity", type: "uint256" },
      { name: "priceWei", type: "uint256" },
      { name: "wallet", type: "address" },
    ],
    outputs: [],
  },
  {
    name: "bookClass",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "classId", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "cancelBooking",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "classId", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "getBookingCount",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "classId", type: "bytes32" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "hasBooked",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "classId", type: "bytes32" },
      { name: "user", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "ClassBooked",
    type: "event",
    inputs: [
      { name: "classId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
  {
    name: "BookingCancelled",
    type: "event",
    inputs: [
      { name: "classId", type: "bytes32", indexed: true },
      { name: "user", type: "address", indexed: true },
    ],
  },
] as const;

export const PULSE_PACKAGES_ABI = [
  {
    name: "purchasePackage",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "packageId", type: "bytes32" },
      { name: "orgWallet", type: "address" },
      { name: "amountUsdc", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "PackagePurchased",
    type: "event",
    inputs: [
      { name: "packageId", type: "bytes32", indexed: true },
      { name: "buyer", type: "address", indexed: true },
      { name: "orgWallet", type: "address", indexed: true },
      { name: "amountUsdc", type: "uint256", indexed: false },
    ],
  },
] as const;

// Base Sepolia USDC
export const USDC_ADDRESS_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
// Base mainnet USDC
export const USDC_ADDRESS_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as `0x${string}`;

export const ERC20_APPROVE_ABI = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
