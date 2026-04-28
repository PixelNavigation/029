// hardhat.config.ts (Complete Deployment Configuration)

import { HardhatUserConfig } from "hardhat/config";
// 1. Load environment variables from .env file
import "dotenv/config"; 
// 2. Import the hardhat-toolbox plugin (includes hardhat-ethers)
import "@nomicfoundation/hardhat-toolbox";


// --- Configuration Variables from .env ---
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ISSUER_PRIVATE_KEY = process.env.ISSUER_PRIVATE_KEY;

// 🚨 CRITICAL CHECK: Throw an error early if keys are missing
if (!ISSUER_PRIVATE_KEY || !SEPOLIA_RPC_URL) {
    throw new Error("FATAL: SEPOLIA_RPC_URL or ISSUER_PRIVATE_KEY is missing. Check your .env file.");
}

const config: HardhatUserConfig = {
    // Ensure this matches your contract's pragma
    solidity: "0.8.20", 
    
    // The toolbox should handle all necessary plugins

    // 2. Define Networks Block
    networks: {
        // The key MUST be 'sepolia' to match your command: npx hardhat run --network sepolia
        sepolia: { 
            // Type assertion (as string) is safe because we checked existence above
            url: SEPOLIA_RPC_URL as string, 
            chainId: 11155111, // Sepolia's Chain ID
            // Private key MUST be provided in an array format
            accounts: [ISSUER_PRIVATE_KEY as string],
        },
        // You can keep the default local hardhat network implicitly
    },
};

export default config;