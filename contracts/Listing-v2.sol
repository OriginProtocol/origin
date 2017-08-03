pragma solidity ^0.4.2;

contract Listing {
  // Listings object
  struct listing {
    bytes ipfsHash; // Listings referenced with Ipfs content hashes (46 characters).
  }

  // Addresses represent listing owners and map to an array of listings.
  mapping (address => listing[]) public listings;

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
    listing memory newListing = listing(ipfsHash);
    listings[msg.sender].push(newListing);
    UpdateListings(msg.sender);
  }

  // function listingsForAddress(address _account) public constant returns (bytes) {
  // uint numberOfListings = listings[_account].length;
  // bytes memory listingsToReturn = new bytes(numberOfListings);
  // for (uint i = 0; i < numberOfListings; i++) {
  //   listingsToReturn[i] = listings[_account][i].ipfsHash;           
  // }
  
  //   return listingsToReturn;
  // }
}
