const fs = require("fs");
const { enhancedResourceEstimation } = require("./enhanced-cot-analysis");

// Convert JSONL to JSON with enhanced resource estimates
async function convertJsonlToJsonEnhanced(inputPath, outputPath) {
  const jsonlContent = fs.readFileSync(inputPath, "utf8");
  const lines = jsonlContent.trim().split("\n");

  const jsonEntries = [];

  for (const line of lines) {
    const entry = JSON.parse(line);
    const resourceEstimation = await enhancedResourceEstimation(entry.log);

    // Add resource usage fields
    jsonEntries.push({
      ...entry,
      CPU: resourceEstimation.cpuUsage.toFixed(2),
      GPU: resourceEstimation.gpuUsage.toFixed(2),
      memory: resourceEstimation.memoryUsage ? resourceEstimation.memoryUsage.toFixed(2) : undefined,
      tokenCount: resourceEstimation.tokenCount,
      complexityScore: resourceEstimation.complexityScore,
      estimatedCost: resourceEstimation.estimatedCost,
      estimationSource: resourceEstimation.source,
    });
  }

  // Write to JSON file
  fs.writeFileSync(outputPath, JSON.stringify(jsonEntries, null, 2));
  console.log(`Converted ${inputPath} to ${outputPath} with enhanced resource estimates`);

  return jsonEntries;
}

module.exports = {
  convertJsonlToJsonEnhanced,
};
