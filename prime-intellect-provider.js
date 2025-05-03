const axios = require("axios");

// Function to query Prime Intellect API for GPU pricing
async function queryPrimeIntellectPricing(cpuUsage, gpuUsage) {
  try {
    const apiKey = process.env.PRIME_INTELLECT_API_KEY;

    const estimatedTokens = Math.ceil(cpuUsage * 10 + gpuUsage * 20);

    let modelType;
    if (gpuUsage > 80) {
      modelType = "h100";
    } else if (gpuUsage > 40) {
      modelType = "a100";
    } else {
      modelType = "a10";
    }

    const response = await axios.get("https://api.primeintellect.ai/v1/pricing", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      params: {
        model_type: modelType,
        token_count: estimatedTokens,
        operation_type: "inference",
      },
    });

    const priceData = response.data;

    const gpuCost = priceData.gpu_cost;
    const cpuCost = priceData.cpu_cost || gpuCost * 0.2;
    const totalCost = priceData.total_cost;

    return {
      provider: "Prime Intellect",
      cpuCost,
      gpuCost,
      totalCost,
      currency: "USD",
      modelType,
      estimatedTokens,
      pricePerToken: priceData.price_per_token,
    };
  } catch (error) {
    console.error("Error querying Prime Intellect pricing:", error);
    return null;
  }
}

module.exports = {
  queryPrimeIntellectPricing,
};
