require("dotenv").config();
const axios = require("axios");

const PRIME_INTELLECT_API_KEY = process.env.PRIME_INTELLECT_API_KEY;

async function queryAwsPricing(cpuUsage, gpuUsage) {
  const cpuPrice = 0.05;
  const gpuPrice = 0.25;
  const cpuCost = cpuUsage * cpuPrice;
  const gpuCost = gpuUsage * gpuPrice;
  return { provider: "AWS", cpuCost, gpuCost, totalCost: cpuCost + gpuCost, currency: "USD" };
}

async function queryBittensorPricing(cpuUsage, gpuUsage) {
  const awsPricing = await queryAwsPricing(cpuUsage, gpuUsage);
  const cpuCost = awsPricing.cpuCost * 0.9;
  const gpuCost = awsPricing.gpuCost * 0.85;
  const totalCost = cpuCost + gpuCost;
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=bittensor&vs_currencies=usd");
  const taoPrice = response.data.bittensor.usd;
  return {
    provider: "Bittensor",
    cpuCost,
    gpuCost,
    totalCost,
    currency: "USD",
    tokenPrice: taoPrice,
    tokens: totalCost / taoPrice,
  };
}

async function queryRenderPricing(cpuUsage, gpuUsage) {
  const awsPricing = await queryAwsPricing(cpuUsage, gpuUsage);
  const cpuCost = awsPricing.cpuCost * 0.95;
  const gpuCost = awsPricing.gpuCost * 0.8;
  const totalCost = cpuCost + gpuCost;
  const response = await axios.get("https://api.coingecko.com/api/v3/simple/price?ids=render-token&vs_currencies=usd");
  const rndrPrice = response.data["render-token"].usd;
  return {
    provider: "Render Network",
    cpuCost,
    gpuCost,
    totalCost,
    currency: "USD",
    tokenPrice: rndrPrice,
    tokens: totalCost / rndrPrice,
  };
}

async function querySuperintelligencePricing(cpuUsage, gpuUsage) {
  const awsPricing = await queryAwsPricing(cpuUsage, gpuUsage);
  const cpuCost = awsPricing.cpuCost * 0.85;
  const gpuCost = awsPricing.gpuCost * 0.85;
  const totalCost = cpuCost + gpuCost;
  const supPrice = 5.0;
  return {
    provider: "Superintelligence",
    cpuCost,
    gpuCost,
    totalCost,
    currency: "USD",
    tokenPrice: supPrice,
    tokens: totalCost / supPrice,
  };
}

async function queryPrimeIntellect(cpuUsage, gpuUsage) {
  try {
    const response = await axios.post(
      "https://api.primeintellect.ai/v1/query",
      {
        cpu: cpuUsage,
        gpu: gpuUsage,
      },
      {
        headers: {
          Authorization: `Bearer ${PRIME_INTELLECT_API_KEY}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error querying Prime Intellect:", error.message);
    throw error;
  }
}

async function queryAllProviders(cpuUsage, gpuUsage) {
  return {
    aws: await queryAwsPricing(cpuUsage, gpuUsage),
    bittensor: await queryBittensorPricing(cpuUsage, gpuUsage),
    render: await queryRenderPricing(cpuUsage, gpuUsage),
    superintelligence: await querySuperintelligencePricing(cpuUsage, gpuUsage),
    primeIntellect: await queryPrimeIntellect(cpuUsage, gpuUsage),
  };
}

module.exports = {
  queryAwsPricing,
  queryBittensorPricing,
  queryRenderPricing,
  querySuperintelligencePricing,
  queryPrimeIntellect,
  queryAllProviders,
};
