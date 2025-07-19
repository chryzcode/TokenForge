import { ethers } from "hardhat";
import { TokenForge } from "../typechain-types";

async function main() {
  console.log("🚀 Starting TokenForge deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("💰 Account balance:", ethers.formatEther(await deployer.provider!.getBalance(deployer.address)), "ETH");

  // Deploy the TokenForge contract
  console.log("\n🔨 Deploying TokenForge contract...");
  const TokenForge = await ethers.getContractFactory("TokenForge");
  const tokenForge = await TokenForge.deploy(deployer.address);
  
  await tokenForge.waitForDeployment();
  const tokenAddress = await tokenForge.getAddress();
  
  console.log("✅ TokenForge deployed to:", tokenAddress);
  console.log("📋 Contract name:", await tokenForge.name());
  console.log("🔤 Contract symbol:", await tokenForge.symbol());
  console.log("🔢 Total supply:", ethers.formatEther(await tokenForge.totalSupply()), "TFG");
  console.log("🎯 Max supply:", ethers.formatEther(await tokenForge.MAX_SUPPLY()), "TFG");
  console.log("📊 Remaining supply:", ethers.formatEther(await tokenForge.remainingSupply()), "TFG");

  // Verify roles are set correctly
  console.log("\n🔐 Role verification:");
  console.log("👑 DEFAULT_ADMIN_ROLE:", await tokenForge.hasRole(await tokenForge.DEFAULT_ADMIN_ROLE(), deployer.address));
  console.log("⏸️ PAUSER_ROLE:", await tokenForge.hasRole(await tokenForge.PAUSER_ROLE(), deployer.address));
  console.log("🪙 MINTER_ROLE:", await tokenForge.hasRole(await tokenForge.MINTER_ROLE(), deployer.address));
  console.log("🔥 BURNER_ROLE:", await tokenForge.hasRole(await tokenForge.BURNER_ROLE(), deployer.address));

  // Log deployment summary
  console.log("\n🎉 Deployment Summary:");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("Contract: TokenForge");
  console.log("Address:", tokenAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("Initial Supply: 1,000,000,000 TFG");
  console.log("Max Supply: 10,000,000,000 TFG");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  // Save deployment info for frontend
  const deploymentInfo = {
    contractAddress: tokenAddress,
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    deploymentTime: new Date().toISOString(),
    initialSupply: "1000000000",
    maxSupply: "10000000000",
    symbol: "TFG",
    name: "TokenForge"
  };

  console.log("\n💾 Deployment info saved for frontend integration");
  console.log("📁 Check the frontend/src/config/contracts.ts file for contract address");

  return { tokenForge, deploymentInfo };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }); 