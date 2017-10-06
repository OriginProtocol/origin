pragma solidity ^0.4.2;

contract Listing {

  struct listingStruct {
    address lister;
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    bytes32 ipfsHash;
    uint price;
    uint unitsAvaliable;
  }

  // Array of all listings
  listingStruct[] public listings;

  // Return number of listings
  function listingsLength() public constant returns (uint) {
      return listings.length;
  }

  // Return listing info
  function getListing(uint index) public constant returns (uint, address, bytes32, uint, uint) {
    return (index, listings[index].lister, listings[index].ipfsHash, listings[index].price, listings[index].unitsAvaliable);
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
  function create(bytes32 ipfsHash, uint price, uint unitsAvaliable) public returns (uint) {
    listings.push(listingStruct(msg.sender, ipfsHash, price, unitsAvaliable));
    UpdateListings(msg.sender);
    return listings.length;
  }

}
