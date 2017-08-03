pragma solidity ^0.4.2;

contract Listing {
  // Addresses represent listing owners and map to an array of listings.
  mapping (address => bytes) public listings;

  // 0rigin owner
  address public origin;

  // Event denoting that a given address has updated its array of listings
  // Currently, this means creating or deleting listings
  // In the future, we will have separate events for specific actions
  event UpdateListings(address from);

  // Defines origin admin address - may be removed for public deployment
  function Listing() {
    origin = msg.sender;
  }

  // Create a new listing
  function create(bytes ipfsHash) {
    // Check for IPFS hash length
    require(ipfsHash.length == 46);

    // May want to de-dupe later by checking for existing hash
    listings[msg.sender] = ipfsHash;
    UpdateListings(msg.sender);
  }
  
  // Need to return a string, not bytes
  function listingFromAddress(address _account) public constant returns (bytes) {
    return listings[_account];
  }
}
