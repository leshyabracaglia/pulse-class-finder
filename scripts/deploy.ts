import { ethers } from "hardhat";

// Base Sepolia USDC address
const USDC_BASE_SEPOLIA = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
// Base mainnet USDC address
const USDC_BASE_MAINNET = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

async function main() {
  const network = await ethers.provider.getNetwork();
  const usdcAddress =
    network.chainId === 8453n ? USDC_BASE_MAINNET : USDC_BASE_SEPOLIA;

  console.log(`Deploying to chain ${network.chainId}...`);

  const PulseBooking = await ethers.getContractFactory("PulseBooking");
  const booking = await PulseBooking.deploy();
  await booking.waitForDeployment();
  console.log("PulseBooking deployed to:", await booking.getAddress());

  const PulsePackages = await ethers.getContractFactory("PulsePackages");
  const packages = await PulsePackages.deploy(usdcAddress);
  await packages.waitForDeployment();
  console.log("PulsePackages deployed to:", await packages.getAddress());

  console.log("\nAdd to .env.local:");
  console.log(`NEXT_PUBLIC_BOOKING_CONTRACT_ADDRESS=${await booking.getAddress()}`);
  console.log(`NEXT_PUBLIC_PACKAGES_CONTRACT_ADDRESS=${await packages.getAddress()}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
