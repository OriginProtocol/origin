pragma solidity ^0.4.24;

import "./ClaimHolder.sol";
import "./V00_UserRegistry.sol";


contract ClaimHolderRegistered is ClaimHolder {

    constructor (
        address _userRegistryAddress
    )
        public
    {
        V00_UserRegistry userRegistry = V00_UserRegistry(_userRegistryAddress);
        userRegistry.registerUser();
    }
}
