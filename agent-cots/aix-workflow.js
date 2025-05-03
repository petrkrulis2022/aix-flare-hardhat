require("dotenv").config(); // Load environment variables from .env file

const { ethers } = require("ethers");
const { processWorkflow } = require("./process-cot-workflow");
const { mintAixTokens } = require("./aix-token-minter");

async function runAixWorkflow(jsonlFilePath, privateKey) {
  try {
    console.log(`Starting AIX workflow for ${jsonlFilePath}`);

    // Step 1: Process the JSONL file
    const outputFilePath = await processWorkflow(jsonlFilePath);
    console.log(`Processed file: ${outputFilePath}`);

    // Step 2: Read the processed JSON file
    const jsonContent = require(outputFilePath);
    const entry = jsonContent[0];
    const cpuUsage = parseFloat(entry.CPU);
    const gpuUsage = parseFloat(entry.GPU);

    // Step 3: Display provider pricing
    console.log("Provider Pricing Comparison:");
    console.log("----------------------------");
    for (const [provider, pricing] of Object.entries(entry.providerPricing)) {
      console.log(`${provider}: $${pricing.totalCost.toFixed(2)}`);
    }

    // Step 4: Select a provider (for simplicity, select the first one)
    const selectedProvider = Object.keys(entry.providerPricing)[0];
    console.log(`Selected provider: ${selectedProvider}`);

    // Step 5: Connect to Flare testnet
    const provider = new ethers.providers.JsonRpcProvider("https://coston2-api.flare.network/ext/bc/C/rpc");
    const wallet = new ethers.Wallet(privateKey, provider);

    // Step 6: Mint AIX tokens
    const mintResult = await mintAixTokens(jsonlFilePath, wallet, selectedProvider);

    // Step 7: Display result
    console.log("Minting Result:");
    console.log("---------------");
    console.log(`Task ID: ${mintResult.taskId}`);
    console.log(`CPU Usage: ${mintResult.cpuUsage} units`);
    console.log(`GPU Usage: ${mintResult.gpuUsage} units`);
    console.log(`Provider: ${mintResult.provider}`);
    console.log(`Cost: $${mintResult.cost.toFixed(2)}`);
    console.log(`Minted: ${mintResult.mintedAmount} AIX tokens`);

    console.log("Workflow completed successfully!");
    return mintResult;
  } catch (error) {
    console.error("Error in AIX workflow:", error);
    throw error;
  }
}

if (require.main === module) {
  if (process.argv.length < 3) {
    console.log("Usage: node aix-workflow.js <input-jsonl-file> [private-key]");
    process.exit(1);
  }

  const inputFile = process.argv[2];
  const privateKey = process.argv.length > 3 ? process.argv[3] : process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("Private key not provided. Set PRIVATE_KEY environment variable or pass as argument.");
    process.exit(1);
  }

  runAixWorkflow(inputFile, privateKey)
    .then(() => console.log("AIX workflow completed."))
    .catch(error => console.error("Error:", error));
}

module.exports = { runAixWorkflow };
