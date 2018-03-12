pragma solidity ^0.4.11;

/// @title UserRegistry
/// @dev Used to keep registry of user identifies
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

contract UserRegistry {
    /*
    * Events
    */

    event NewUser(uint _index);

    /*
    * Storage
    */

    // Array of all users
    userStruct[] public users;

    /*
    * Structs
    */

    struct userStruct {
        address owner;
        bytes32 ipfsHash;
    }

    /*
    * Modifiers
    */

    modifier isValidUserIndex(uint _index) {
        require (_index < users.length);
        _;
    }

    modifier isOwner(uint _index) {
      require (msg.sender == users[_index].owner);
      _;
    }

    /*
    * Public functions
    */

    /// @dev create(): Create a new user
    /// @param _ipfsHash Hash of data on ipfsHash
    function create(
        bytes32 _ipfsHash
    )
        public
        returns (uint)
    {
        users.push(userStruct(msg.sender, _ipfsHash));
        NewUser(users.length-1);
        return users.length;
    }

    /// @dev create(): Create a new user
    /// @param _ipfsHash Hash of data on ipfsHash
    function update(
        uint _index,
        bytes32 _ipfsHash
    )
        public
        isValidUserIndex(_index)
        isOwner(_index)
    {
        users[_index].ipfsHash = _ipfsHash;
    }

    /// @dev create_another(): Create a new user and associates attenstion or proof with user
    // @param wallet id
    // Attestation or proof to associate to the user
    function create_another(string _id, string payload) public returns (string){
        return payload;
    }

    /// @dev get(): returns and existing user associated with wallet id
    // @param wallet id
    function get(string _id) public returns (string){
        return _id;
    }
}
