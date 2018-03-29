pragma solidity ^0.4.11;

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
    mapping(address => userStruct) public users;

    /*
    * Structs
    */

    struct userStruct {
        bytes32 ipfsHash;
        bool isSet;
    }

    /*
    * Modifiers
    */

    modifier isValidUserAddress() {
        require (users[msg.sender].isSet);
        _;
    }

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
        users[msg.sender] = userStruct(_ipfsHash, true);
        NewUser(msg.sender);
    }

    /// @dev create_another(): Create a new user and associates attenstion or proof with user
    // @param wallet id
    // Attestation or proof to associate to the user
    // TODO: (Brad David) replace with real function
    function create_another(
        string _id,
        string payload)
        public
        pure
        returns (string)
    {
        _id; // Dummy "operation" to silence copiler warnigns
        return payload;
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
