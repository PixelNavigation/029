// scripts/deploy.ts (Clean Runtime Check)

import * as hre from "hardhat"; 
import { Signer } from "ethers";

async function main() {
  // FINAL CHECK: Hardhat should have injected 'ethers' into 'hre'
  const { ethers } = hre as any; // Keep 'as any' just to satisfy the TS checker 

  // CRITICAL CHECK: If ethers is still undefined here, the plugin is broken.
  if (!ethers) {
    throw new Error("Ethers object is undefined. Hardhat plugin failed to load.");
  }
  
  // 1. Get the deployer address
  const [deployer]: Signer[] = await ethers.getSigners(); 

  // ... rest of the deployment logic (getContractFactory, deploy, etc.) ...
  
  const VerifierFactory = await ethers.getContractFactory("CertificateVerifier");
  const verifier = await VerifierFactory.deploy();
  
  // ... (waitForDeployment and console logs) ...
  await verifier.waitForDeployment();
  const contractAddress = await verifier.getAddress();

  console.log(`Contract deployed successfully!`);
  console.log(`Contract Address (The Address You Need): ${contractAddress}`);
  console.log("-----------------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});