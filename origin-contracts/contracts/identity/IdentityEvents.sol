pragma solidity ^0.4.24;

//
// A contract to emit events to track changes of users identity data stored in IPFS.
//

contract IdentityEvents {
    event IdentityUpdated(address indexed account, bytes32 ipfsHash);
    event IdentityDeleted(address indexed account);

    // @param ipfsHash IPFS hash of the updated identity.
    function emitIdentityUpdated(bytes32 ipfsHash) public {
        emit IdentityUpdated(msg.sender, ipfsHash);
    }

    function emitIdentityDeleted() public {
        emit IdentityDeleted(msg.sender);
    }
}