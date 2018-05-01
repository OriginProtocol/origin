pragma solidity ^0.4.21;

import './identity/ClaimHolderPresigned.sol';

/// @title UserRegistry
/// @dev Used to keep registry of user identifies
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

contract UserRegistry {
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

    /// @dev create(): Create a user
    function createUser() public
    {
        ClaimHolder _identity = new ClaimHolder();
        users[msg.sender] = _identity;
        emit NewUser(msg.sender, _identity);
    }

    /// @dev createWithClaims(): Create a user with presigned claims
    // Params correspond to params of ClaimHolderPresigned
    function createUserWithClaims(
        uint256[] _claimType,
        address[] _issuer,
        bytes _signature,
        bytes _data,
        uint256[] _offsets
    )
        public
    {
        ClaimHolderPresigned _identity = new ClaimHolderPresigned(
          _claimType,
          _issuer,
          _signature,
          _data,
          _offsets
        );
        users[msg.sender] = _identity;
        emit NewUser(msg.sender, _identity);
    }
}
