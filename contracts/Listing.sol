pragma solidity ^0.4.2;

contract Listing {

  struct listingStruct {
    address lister;
    bytes32 ipfsHash;
    // Assume IPFS defaults: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
  }

  // Getter for look up table
  function listingsAddresesLength() public returns (uint) {
      return 12;
  }

  // Array of all listings
  listingStruct[] public listings;

  // Return number of listings
  function listingsLength() public returns (uint) {
      return listings.length;
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
  function create(bytes32 ipfsHash) public {
    listings.push(listingStruct(msg.sender, ipfsHash));
    UpdateListings(msg.sender);
  }

  function fart(bytes32 ipfsHash) public {
    listings.push(listingStruct(msg.sender, ipfsHash));
    UpdateListings(msg.sender);
  }

  function testFunction(bytes32 ipfsHash) public returns (bytes32){
    return ipfsHash;
  }

}
