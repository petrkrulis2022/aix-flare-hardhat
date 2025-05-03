const fs = require("fs");
const { convertJsonlToJson } = require("./convert-cot");
const { queryAllProviders } = require("./query-providers");

async function processWorkflow(jsonlFilePath) {
  try {
    console.log(`Starting workflow for ${jsonlFilePath}`);

    // Step 1: Convert JSONL to JSON with CPU/GPU estimates
    const jsonFilePath = jsonlFilePath.replace(".jsonl", ".json");
    convertJsonlToJson(jsonlFilePath, jsonFilePath);
    console.log("Step 1 completed: JSONL converted to JSON with CPU/GPU estimates");

    // Step 2: Query provider pricing
    const jsonContent = JSON.parse(fs.readFileSync(jsonFilePath, "utf8"));
    const results = [];

    for (const entry of jsonContent) {
      const cpuUsage = parseFloat(entry.CPU);
      const gpuUsage = parseFloat(entry.GPU);
      const providerPricing = await queryAllProviders(cpuUsage, gpuUsage);
      results.push({ ...entry, providerPricing });
    }

    const outputFilePath = jsonlFilePath.replace(".jsonl", "-with-pricing.json");
    fs.writeFileSync(outputFilePath, JSON.stringify(results, null, 2));
    console.log(`Step 2 completed: Provider pricing added to ${outputFilePath}`);

    return outputFilePath;
  } catch (error) {
    console.error("Error in workflow:", error);
    throw error;
  }
}

if (require.main === module) {
  if (process.argv.length < 3) {
    console.log("Usage: node process-cot-workflow.js <input-jsonl-file>");
    process.exit(1);
  }

  const inputFile = process.argv[2];
  processWorkflow(inputFile)
    .then(outputFile => console.log(`Workflow completed. Output file: ${outputFile}`))
    .catch(error => console.error("Error:", error));
}

module.exports = { processWorkflow };
