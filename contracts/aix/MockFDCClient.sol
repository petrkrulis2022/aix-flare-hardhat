// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MockFDCClient {
  mapping(bytes32 => bool) public attestations;

  function submitAttestationRequest(string memory, bytes32 requestId, bytes memory) external returns (bool) {
    // For demo purposes, automatically verify all attestations
    attestations[requestId] = true;
    return true;
  }

  function checkAttestationStatus(bytes32 requestId) external view returns (bool verified, bytes memory data) {
    return (attestations[requestId], "");
  }
}
