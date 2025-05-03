const axios = require("axios");

// Function to analyze chain of thought using Prime Intellect API
async function analyzeCotWithPrimeIntellect(cotText) {
  try {
    const apiKey = process.env.PRIME_INTELLECT_API_KEY;

    const response = await axios.post(
      "https://api.primeintellect.ai/v1/analyze",
      {
        text: cotText,
        analysis_type: "resource_estimation",
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const analysisData = response.data;

    return {
      cpuUsage: analysisData.cpu_usage,
      gpuUsage: analysisData.gpu_usage,
      memoryUsage: analysisData.memory_usage,
      tokenCount: analysisData.token_count,
      complexityScore: analysisData.complexity_score,
      estimatedCost: analysisData.estimated_cost,
    };
  } catch (error) {
    console.error("Error analyzing chain of thought with Prime Intellect:", error);
    return null;
  }
}

// Function to enhance our existing CPU/GPU estimation with Prime Intellect analysis
async function enhancedResourceEstimation(logContent) {
  const tokenCount = logContent.split(/\s+/).length;
  const reasoningSteps = (logContent.match(/\d+\.\s+\*\*/g) || []).length;

  const basicCpuUsage = Math.min(100, tokenCount * 0.5 + reasoningSteps * 2);
  const basicGpuUsage = Math.min(100, tokenCount * 0.3 + reasoningSteps * 1.5);

  try {
    const primeIntellectAnalysis = await analyzeCotWithPrimeIntellect(logContent);

    if (primeIntellectAnalysis) {
      const cpuUsage = basicCpuUsage * 0.3 + primeIntellectAnalysis.cpuUsage * 0.7;
      const gpuUsage = basicGpuUsage * 0.3 + primeIntellectAnalysis.gpuUsage * 0.7;

      return {
        cpuUsage,
        gpuUsage,
        memoryUsage: primeIntellectAnalysis.memoryUsage,
        tokenCount: primeIntellectAnalysis.tokenCount,
        complexityScore: primeIntellectAnalysis.complexityScore,
        estimatedCost: primeIntellectAnalysis.estimatedCost,
        source: "enhanced",
      };
    }
  } catch (error) {
    console.warn("Prime Intellect analysis failed, falling back to basic estimation:", error);
  }

  return {
    cpuUsage: basicCpuUsage,
    gpuUsage: basicGpuUsage,
    source: "basic",
  };
}

module.exports = {
  analyzeCotWithPrimeIntellect,
  enhancedResourceEstimation,
};
