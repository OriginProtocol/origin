pragma solidity ^0.4.2;

contract Listing {

  // 0rigin owner
  address public origin;

  // Defines origin admin address - may be removed for public deployment
  function Listing() {
    origin = msg.sender;
  }

  struct listingStruct {
    address lister;
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    bytes32 ipfsHash;
    uint price;
    uint unitsAvailable;
  }

  // Array of all listings
  listingStruct[] public listings;

  // Return number of listings
  function listingsLength() public constant returns (uint) {
      return listings.length;
  }

  // Return listing info
  function getListing(uint index) public constant returns (uint, address, bytes32, uint, uint) {
    // TODO: Determine if less gas to do one array lookup into var, and return var struct parts
    return (
      index,
      listings[index].lister,
      listings[index].ipfsHash,
      listings[index].price,
      listings[index].unitsAvailable
    );
  }

  // Event denoting that a given address has updated its array of listings
  // Currently, this means creating or deleting listings
  // In the future, we will have separate events for specific actions
  event UpdateListings(address from);

  // Create a new listing
  function create(bytes32 ipfsHash, uint price, uint unitsAvailable) public returns (uint) {
    listings.push(listingStruct(msg.sender, ipfsHash, price, unitsAvailable));
    UpdateListings(msg.sender);
    return listings.length;
  }

}
