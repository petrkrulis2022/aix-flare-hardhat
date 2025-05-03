const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy AIX Token
  const AIXToken = await hre.ethers.getContractFactory("AIXToken");
  const aixToken = await AIXToken.deploy();
  await aixToken.waitForDeployment();
  console.log("AIXToken deployed to:", await aixToken.getAddress());

  // Deploy Mock FTSO Registry
  const MockFTSORegistry = await hre.ethers.getContractFactory("MockFTSORegistry");
  const mockFtsoRegistry = await MockFTSORegistry.deploy();
  await mockFtsoRegistry.waitForDeployment();
  console.log("MockFTSORegistry deployed to:", await mockFtsoRegistry.getAddress());

  // Deploy Resource Price Oracle
  const ResourcePriceOracle = await hre.ethers.getContractFactory("ResourcePriceOracle");
  const priceOracle = await ResourcePriceOracle.deploy(await mockFtsoRegistry.getAddress());
  await priceOracle.waitForDeployment();
  console.log("ResourcePriceOracle deployed to:", await priceOracle.getAddress());

  // Deploy Mock FDC Client
  const MockFDCClient = await hre.ethers.getContractFactory("MockFDCClient");
  const mockFdcClient = await MockFDCClient.deploy();
  await mockFdcClient.waitForDeployment();
  console.log("MockFDCClient deployed to:", await mockFdcClient.getAddress());

  // Deploy Recall Verifier
  const RecallVerifier = await hre.ethers.getContractFactory("RecallVerifier");
  const recallVerifier = await RecallVerifier.deploy(await mockFdcClient.getAddress());
  await recallVerifier.waitForDeployment();
  console.log("RecallVerifier deployed to:", await recallVerifier.getAddress());

  // Set contract addresses in RecallVerifier
  await recallVerifier.setContractAddresses(await aixToken.getAddress(), await priceOracle.getAddress());
  console.log("RecallVerifier configured");

  // Deploy AIX Validator
  const AIXValidator = await hre.ethers.getContractFactory("AIXValidator");
  const aixValidator = await AIXValidator.deploy(
    await aixToken.getAddress(),
    await recallVerifier.getAddress(),
    await priceOracle.getAddress()
  );
  await aixValidator.waitForDeployment();
  console.log("AIXValidator deployed to:", await aixValidator.getAddress());

  // Add validator as authorized minter
  await aixToken.addMinter(await aixValidator.getAddress());
  console.log("AIXValidator added as authorized minter");

  console.log("Deployment complete!");
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
