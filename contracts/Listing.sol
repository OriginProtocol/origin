pragma solidity ^0.4.2;

contract Listing {
  // Addresses represent listing owners and map to an array of listings.
  mapping (address => string) public listings;
  // Look up table for keys
  address[] public listingsAddreses;

  // Getter for look up table
  function listingsAddresesLength() public returns (uint) {
      return listingsAddreses.length;
  }

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
  function create(string ipfsHash) {
    // Check for IPFS hash length

    require(bytes(ipfsHash).length == 46);

    // Update look up table if its first listing for this sender
    if (bytes(listings[msg.sender]).length == 0) {
      listingsAddreses.push(msg.sender);
    }
    // May want to de-dupe later by checking for existing hash
    listings[msg.sender] = ipfsHash;

    UpdateListings(msg.sender);
  }

  // Change this to return multiple listings later
  function listingForAddress(address _account) public constant returns (string) {
    return listings[_account];
  }
}
