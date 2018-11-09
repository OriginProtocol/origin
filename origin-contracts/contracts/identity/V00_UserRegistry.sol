pragma solidity ^0.4.24;

import "./ClaimHolderPresigned.sol";

/// @title UserRegistry
/// @dev Used to keep registry of user identifies
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>


contract V00_UserRegistry {
    /*
    * Events
    */

    event NewUser(address _address, address _identity);

    /*
    * Storage
    */

    // Mapping from ethereum wallet to ERC725 identity
    mapping(address => address) public users;

    /*
    * Public functions
    */

    /// @dev registerUser(): Add a user to the registry
    function registerUser()
        public
    {
        users[tx.origin] = msg.sender;
        emit NewUser(tx.origin, msg.sender);
    }

    /// @dev clearUser(): Remove user from the registry
    function clearUser()
        public
    {
        users[msg.sender] = 0;
    }
}
