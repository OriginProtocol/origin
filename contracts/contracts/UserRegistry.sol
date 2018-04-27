pragma solidity ^0.4.21;

/// @title UserRegistry
/// @dev Used to keep registry of user identifies
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

contract UserRegistry {
    /*
    * Events
    */

    event NewUser(address _address);

    /*
    * Storage
    */

    // Mapping of all users
    mapping(address => bytes32) public users;

    /*
    * Public functions
    */

    /// @dev create(): Create a new user
    /// @param _ipfsHash Hash of data on ipfsHash
    function set(
        bytes32 _ipfsHash
    )
        public
    {
        users[msg.sender] = _ipfsHash;
        emit NewUser(msg.sender);
    }

    /// @dev get(): returns and existing user associated with wallet id
    // @param wallet id
    function get(
        string _id
    )
        public
        pure
        returns (string)
    {
        return _id;
    }
}
