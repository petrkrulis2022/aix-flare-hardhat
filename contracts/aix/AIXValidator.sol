// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IAIXToken {
  function recordTaskResources(bytes32 taskId, uint256 cpuUsage, uint256 gpuUsage) external;

  function mintForTask(address to, bytes32 taskId) external returns (uint256);
}

interface IRecallVerifier {
  function requestVerification(
    bytes32 taskId,
    bytes memory recallData,
    uint256 cpuUsage,
    uint256 gpuUsage
  ) external returns (bytes32);

  function checkVerification(
    bytes32 attestationId
  ) external view returns (bool verified, bytes32 taskId, address requester, uint256 cpuUsage, uint256 gpuUsage);
}

interface IResourcePriceOracle {
  function getResourceCost(
    string memory provider,
    uint256 cpuUsage,
    uint256 gpuUsage
  ) external view returns (uint256 totalCost, uint256 cpuCost, uint256 gpuCost);
}

contract AIXValidator is Ownable {
  IAIXToken public aixToken;
  IRecallVerifier public recallVerifier;
  IResourcePriceOracle public priceOracle;

  struct Task {
    bytes32 taskId;
    address worker;
    bytes32 attestationId;
    bool verified;
    bool paid;
    uint256 timestamp;
  }

  mapping(bytes32 => Task) public tasks;

  event TaskSubmitted(bytes32 taskId, address worker);
  event TaskVerified(bytes32 taskId, bool success);
  event TaskPaid(bytes32 taskId, address worker, uint256 amount);

  constructor(address _aixToken, address _recallVerifier, address _priceOracle) Ownable(msg.sender) {
    aixToken = IAIXToken(_aixToken);
    recallVerifier = IRecallVerifier(_recallVerifier);
    priceOracle = IResourcePriceOracle(_priceOracle);
  }

  function submitTask(
    bytes32 taskId,
    bytes memory recallData,
    uint256 cpuUsage,
    uint256 gpuUsage
  ) external returns (bytes32) {
    bytes32 attestationId = recallVerifier.requestVerification(taskId, recallData, cpuUsage, gpuUsage);

    tasks[taskId] = Task({
      taskId: taskId,
      worker: msg.sender,
      attestationId: attestationId,
      verified: false,
      paid: false,
      timestamp: block.timestamp
    });

    emit TaskSubmitted(taskId, msg.sender);

    return attestationId;
  }

  function verifyTask(bytes32 taskId) external returns (bool) {
    Task storage task = tasks[taskId];
    require(task.timestamp > 0, "Task not found");
    require(!task.verified, "Task already verified");

    (bool verified, , , uint256 cpuUsage, uint256 gpuUsage) = recallVerifier.checkVerification(task.attestationId);

    if (verified) {
      aixToken.recordTaskResources(taskId, cpuUsage, gpuUsage);
      task.verified = true;
    }

    emit TaskVerified(taskId, verified);

    return verified;
  }

  function payForTask(bytes32 taskId) external returns (uint256) {
    Task storage task = tasks[taskId];
    require(task.timestamp > 0, "Task not found");
    require(task.verified, "Task not verified");
    require(!task.paid, "Task already paid");

    uint256 amount = aixToken.mintForTask(task.worker, taskId);
    task.paid = true;

    emit TaskPaid(taskId, task.worker, amount);

    return amount;
  }
}
