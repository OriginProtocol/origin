pragma solidity 0.4.23;

/// @title Listing
/// @dev An indiviual Origin Listing representing an offer for booking/purchase


contract Listing {

  /*
   * Events
   */

  event ListingChange();

    /*
    * Storage
    */

    address public owner;
    address public listingRegistry; // TODO: Define interface for real ListingRegistry ?
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    // This assumption may have to change in future, but saves space now
    bytes32 public ipfsHash;
    uint public created;
    uint public expiration;

  /*
    * Modifiers
    */

  modifier isSeller() {
    require(msg.sender == owner);
    _;
  }

  modifier isNotSeller() {
    require(msg.sender != owner);
    _;
  }

}
