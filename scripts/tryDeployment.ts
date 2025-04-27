import "@nomicfoundation/hardhat-verify";
import { ethers } from "hardhat";
const AIXToken = artifacts.require("AIXToken");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AIXToken contract
  const aixToken = await AIXToken.new();
  console.log("AIXToken deployed to:", aixToken.address);
}

void main().then(() => process.exit(0));
