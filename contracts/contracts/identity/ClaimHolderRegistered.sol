pragma solidity ^0.4.24;

import './ClaimHolder.sol';
import './UserRegistry.sol';

contract ClaimHolderRegistered is ClaimHolder {

  constructor (
    address _userRegistryAddress
  )
      public
  {
      UserRegistry userRegistry = UserRegistry(_userRegistryAddress);
      userRegistry.registerUser();
  }
}
