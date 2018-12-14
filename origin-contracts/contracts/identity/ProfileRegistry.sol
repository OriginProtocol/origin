pragma solidity ^0.4.24;

// A contract to map users ETH address to an IPFS hash of their profile.
//
// It is expected that off-chain systems pinning the IPFS content will honor
// the delete action and unpin all hashes associated with a deleted profile.
//

contract ProfileRegistry {
    // @notice Event emitted on profile change.
    // @param account ETH address of the user.
    // @param action Created/Updated=1 Deleted=2
    event ProfileAction(address indexed account, uint action, bytes32 ipfsHash);

    mapping(address => bytes32) public profiles;

    // @notice Create or update a profile.
    // @param ipfsHash IPFS hash of the updated profile.
    function updateProfile(bytes32 ipfsHash) public {
        profiles[msg.sender] = ipfsHash;
        emit ProfileAction(msg.sender, 1, ipfsHash);
    }

    // @dev Delete a profile.
    function deleteProfile() public {
        delete profiles[msg.sender];
        emit ProfileAction(msg.sender, 2, 0x0);
    }
}