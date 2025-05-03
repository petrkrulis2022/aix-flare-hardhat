const { ethers } = require("ethers");
const { processWorkflow } = require("./process-cot-workflow");

async function mintAixTokens(jsonlFilePath, provider, selectedProvider) {
  try {
    console.log(`Starting AIX token minting process for ${jsonlFilePath}`);

    // Step 1: Process the JSONL file to get resource usage and pricing
    const outputFilePath = await processWorkflow(jsonlFilePath);
    console.log(`Processed file: ${outputFilePath}`);

    // Step 2: Read the processed JSON file
    const jsonContent = require(outputFilePath);
    const entry = jsonContent[0];
    const cpuUsage = parseFloat(entry.CPU);
    const gpuUsage = parseFloat(entry.GPU);

    // Step 3: Get pricing for the selected provider
    const providerPricing = entry.providerPricing[selectedProvider];
    console.log(`Selected provider: ${providerPricing.provider}`);
    console.log(`Total cost: $${providerPricing.totalCost.toFixed(2)}`);

    // Step 4: Generate a task ID
    const taskId = ethers.utils.id(jsonlFilePath + Date.now().toString());
    console.log(`Generated task ID: ${taskId}`);

    // Step 5: Connect to contracts
    const signer = provider.getSigner();
    const aixValidatorAddress = "YOUR_AIX_VALIDATOR_ADDRESS"; // Replace with your deployed contract address
    const aixValidatorAbi = [
      "function submitTask(bytes32 taskId, bytes memory recallData, uint256 cpuUsage, uint256 gpuUsage) external returns (bytes32)",
      "function verifyTask(bytes32 taskId) external returns (bool)",
      "function payForTask(bytes32 taskId) external returns (uint256)",
    ];
    const aixValidator = new ethers.Contract(aixValidatorAddress, aixValidatorAbi, signer);

    // Step 6: Submit the task
    console.log("Submitting task to AIX Validator...");
    const recallData = ethers.utils.toUtf8Bytes(JSON.stringify(entry));
    const cpuUsageWei = ethers.utils.parseUnits(cpuUsage.toString(), 0);
    const gpuUsageWei = ethers.utils.parseUnits(gpuUsage.toString(), 0);
    const submitTx = await aixValidator.submitTask(taskId, recallData, cpuUsageWei, gpuUsageWei);
    await submitTx.wait();
    console.log("Task submitted.");

    // Step 7: Verify the task
    console.log("Verifying task...");
    const verifyTx = await aixValidator.verifyTask(taskId);
    await verifyTx.wait();
    console.log("Task verified.");

    // Step 8: Pay for the task (mint AIX tokens)
    console.log("Paying for task (minting AIX tokens)...");
    const payTx = await aixValidator.payForTask(taskId);
    const payReceipt = await payTx.wait();
    console.log("Payment completed.");

    // Step 9: Get the minted amount from the event logs
    const taskPaidEvent = payReceipt.events.find(event => event.event === "TaskPaid");
    const mintedAmount = taskPaidEvent ? ethers.BigNumber.from(taskPaidEvent.args[2]).toString() : "Unknown";
    console.log(`Minted ${ethers.utils.formatEther(mintedAmount)} AIX tokens`);

    return {
      taskId,
      cpuUsage,
      gpuUsage,
      provider: providerPricing.provider,
      cost: providerPricing.totalCost,
      mintedAmount: ethers.utils.formatEther(mintedAmount),
    };
  } catch (error) {
    console.error("Error minting AIX tokens:", error);
    throw error;
  }
}

module.exports = { mintAixTokens };
