// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFtsoRegistry {
  function getCurrentPrice(
    string memory _symbol
  ) external view returns (uint256 _price, uint256 _timestamp, uint256 _decimals);
}

contract ResourcePriceOracle is Ownable {
  IFtsoRegistry public ftsoRegistry;
  string public bittensorSymbol = "TAO";
  string public renderSymbol = "RNDR";
  string public superintelligenceSymbol = "SUP";
  uint256 public awsCpuPrice = 5;
  uint256 public awsGpuPrice = 25;

  struct PriceData {
    uint256 price;
    uint256 timestamp;
    uint256 decimals;
  }

  mapping(string => PriceData) public providerPrices;

  event PriceUpdated(string provider, uint256 price, uint256 timestamp);
  event AwsPriceUpdated(string resourceType, uint256 newPrice);

  constructor(address _ftsoRegistry) Ownable(msg.sender) {
    ftsoRegistry = IFtsoRegistry(_ftsoRegistry);
  }

  function updateFtsoRegistry(address _ftsoRegistry) external onlyOwner {
    ftsoRegistry = IFtsoRegistry(_ftsoRegistry);
  }

  function updateAwsPrices(uint256 _cpuPrice, uint256 _gpuPrice) external onlyOwner {
    awsCpuPrice = _cpuPrice;
    awsGpuPrice = _gpuPrice;
    emit AwsPriceUpdated("CPU", _cpuPrice);
    emit AwsPriceUpdated("GPU", _gpuPrice);
  }

  function fetchCurrentPrices() external {
    (uint256 taoPrice, uint256 taoTimestamp, uint256 taoDecimals) = ftsoRegistry.getCurrentPrice(bittensorSymbol);
    providerPrices["Bittensor"] = PriceData(taoPrice, taoTimestamp, taoDecimals);
    emit PriceUpdated("Bittensor", taoPrice, taoTimestamp);

    (uint256 rndrPrice, uint256 rndrTimestamp, uint256 rndrDecimals) = ftsoRegistry.getCurrentPrice(renderSymbol);
    providerPrices["Render"] = PriceData(rndrPrice, rndrTimestamp, rndrDecimals);
    emit PriceUpdated("Render", rndrPrice, rndrTimestamp);

    (uint256 supPrice, uint256 supTimestamp, uint256 supDecimals) = ftsoRegistry.getCurrentPrice(
      superintelligenceSymbol
    );
    providerPrices["Superintelligence"] = PriceData(supPrice, supTimestamp, supDecimals);
    emit PriceUpdated("Superintelligence", supPrice, supTimestamp);
  }
}
