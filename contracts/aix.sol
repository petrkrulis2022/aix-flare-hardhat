// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AIXToken is ERC20, Ownable {
  // Resource usage tracking
  struct ComputationalResources {
    uint256 cpuUsage;
    uint256 gpuUsage;
    uint256 timestamp;
  }

  // Mapping from task ID to computational resources
  mapping(bytes32 => ComputationalResources) public taskResources;

  // Resource pricing (in token units)
  uint256 public cpuPricePerUnit = 1 * 10 ** 16; // 0.01 AIX per CPU unit
  uint256 public gpuPricePerUnit = 5 * 10 ** 16; // 0.05 AIX per GPU unit

  // Authorized minters (validators)
  mapping(address => bool) public authorizedMinters;

  // Events
  event ResourcesRecorded(bytes32 taskId, uint256 cpuUsage, uint256 gpuUsage);
  event PriceUpdated(string resourceType, uint256 newPrice);

  constructor() ERC20("AI Exchange Token", "AIX") Ownable(msg.sender) {
    // Mint initial supply to deployer
    _mint(msg.sender, 1000000 * 10 ** 18); // 1 million AIX
  }

  // Add a minter
  function addMinter(address minter) external onlyOwner {
    authorizedMinters[minter] = true;
  }

  // Remove a minter
  function removeMinter(address minter) external onlyOwner {
    authorizedMinters[minter] = false;
  }

  // Record computational resources for a task
  function recordTaskResources(bytes32 taskId, uint256 cpuUsage, uint256 gpuUsage) external {
    require(authorizedMinters[msg.sender], "Not authorized to record resources");

    taskResources[taskId] = ComputationalResources({
      cpuUsage: cpuUsage,
      gpuUsage: gpuUsage,
      timestamp: block.timestamp
    });

    emit ResourcesRecorded(taskId, cpuUsage, gpuUsage);
  }

  // Mint tokens based on computational resources
  function mintForTask(address to, bytes32 taskId) external returns (uint256) {
    require(authorizedMinters[msg.sender], "Not authorized to mint");
    require(taskResources[taskId].timestamp > 0, "Task resources not recorded");

    // Calculate token amount based on resource usage
    uint256 cpuCost = taskResources[taskId].cpuUsage * cpuPricePerUnit;
    uint256 gpuCost = taskResources[taskId].gpuUsage * gpuPricePerUnit;
    uint256 totalAmount = cpuCost + gpuCost;

    // Mint tokens
    _mint(to, totalAmount);

    // Clear task resources to prevent double-minting
    delete taskResources[taskId];

    return totalAmount;
  }

  // Update resource pricing (only owner)
  function updateResourcePricing(uint256 newCpuPrice, uint256 newGpuPrice) external onlyOwner {
    cpuPricePerUnit = newCpuPrice;
    gpuPricePerUnit = newGpuPrice;

    emit PriceUpdated("CPU", newCpuPrice);
    emit PriceUpdated("GPU", newGpuPrice);
  }
}
