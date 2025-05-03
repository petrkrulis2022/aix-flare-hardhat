// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IFDCClient {
  function submitAttestationRequest(
    string memory attestationType,
    bytes32 requestId,
    bytes memory data
  ) external returns (bool);

  function checkAttestationStatus(bytes32 requestId) external view returns (bool verified, bytes memory data);
}

contract RecallVerifier is Ownable {
  IFDCClient public fdcClient;
  address public aixToken;
  address public priceOracle;

  struct AttestationRequest {
    bytes32 taskId;
    address requester;
    bool verified;
    uint256 cpuUsage;
    uint256 gpuUsage;
    uint256 timestamp;
  }

  mapping(bytes32 => AttestationRequest) public attestations;

  event AttestationRequested(bytes32 attestationId, bytes32 taskId, address requester);
  event AttestationVerified(bytes32 attestationId, bool success);

  constructor(address _fdcClient) Ownable(msg.sender) {
    fdcClient = IFDCClient(_fdcClient);
  }

  function setContractAddresses(address _aixToken, address _priceOracle) external onlyOwner {
    aixToken = _aixToken;
    priceOracle = _priceOracle;
  }

  function requestVerification(
    bytes32 taskId,
    bytes memory recallData,
    uint256 cpuUsage,
    uint256 gpuUsage
  ) external returns (bytes32) {
    bytes32 attestationId = keccak256(abi.encodePacked(taskId, msg.sender, block.timestamp));

    attestations[attestationId] = AttestationRequest({
      taskId: taskId,
      requester: msg.sender,
      verified: false,
      cpuUsage: cpuUsage,
      gpuUsage: gpuUsage,
      timestamp: block.timestamp
    });

    fdcClient.submitAttestationRequest("RECALL_DATA", attestationId, recallData);

    emit AttestationRequested(attestationId, taskId, msg.sender);

    return attestationId;
  }

  function checkVerification(
    bytes32 attestationId
  ) external view returns (bool verified, bytes32 taskId, address requester, uint256 cpuUsage, uint256 gpuUsage) {
    AttestationRequest storage request = attestations[attestationId];
    require(request.timestamp > 0, "Attestation not found");

    if (request.verified) {
      return (true, request.taskId, request.requester, request.cpuUsage, request.gpuUsage);
    }

    (bool fdcVerified, ) = fdcClient.checkAttestationStatus(attestationId);

    return (fdcVerified, request.taskId, request.requester, request.cpuUsage, request.gpuUsage);
  }

  function attestationCallback(bytes32 attestationId, bool verified) external {
    AttestationRequest storage request = attestations[attestationId];
    request.verified = verified;

    emit AttestationVerified(attestationId, verified);
  }
}
