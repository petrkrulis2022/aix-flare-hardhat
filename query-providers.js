const axios = require("axios");
const { queryPrimeIntellectPricing } = require("./prime-intellect-provider");

// Function to query all providers
async function queryAllProviders(cpuUsage, gpuUsage) {
  const awsPricing = await queryAwsPricing(cpuUsage, gpuUsage);
  const bittensorPricing = await queryBittensorPricing(cpuUsage, gpuUsage);
  const renderPricing = await queryRenderPricing(cpuUsage, gpuUsage);
  const supPricing = await querySuperintelligencePricing(cpuUsage, gpuUsage);
  const primeIntellectPricing = await queryPrimeIntellectPricing(cpuUsage, gpuUsage);

  return {
    aws: awsPricing,
    bittensor: bittensorPricing,
    render: renderPricing,
    superintelligence: supPricing,
    primeIntellect: primeIntellectPricing,
  };
}

module.exports = {
  queryAllProviders,
};
