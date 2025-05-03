const fs = require("fs");
const path = require("path");

// Function to estimate CPU/GPU usage based on chain of thought complexity
function estimateResourceUsage(logContent) {
  const tokenCount = logContent.split(/\s+/).length;
  const cpuUsage = Math.min(100, tokenCount * 0.5);
  const gpuUsage = Math.min(100, tokenCount * 0.3);
  return { cpuUsage, gpuUsage };
}

// Convert JSONL to JSON with resource estimates
function convertJsonlToJson(inputPath, outputPath) {
  const jsonlContent = fs.readFileSync(inputPath, "utf8");
  const lines = jsonlContent.trim().split("\n");

  const jsonEntries = lines.map(line => {
    const entry = JSON.parse(line);
    const { cpuUsage, gpuUsage } = estimateResourceUsage(entry.log);
    return { ...entry, CPU: cpuUsage.toFixed(2), GPU: gpuUsage.toFixed(2) };
  });

  fs.writeFileSync(outputPath, JSON.stringify(jsonEntries, null, 2));
  console.log(`Converted ${inputPath} to ${outputPath} with resource estimates`);
  return jsonEntries;
}

const inputFile = process.argv[2];
const outputFile = inputFile.replace(".jsonl", ".json");
convertJsonlToJson(inputFile, outputFile);
