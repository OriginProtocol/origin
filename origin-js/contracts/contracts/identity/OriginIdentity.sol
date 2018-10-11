pragma solidity ^0.4.24;

import "./ClaimHolder.sol";

// This will be deployed exactly once and represents Origin Protocol's
// own identity for use in signing attestations.


contract OriginIdentity is ClaimHolder {}
