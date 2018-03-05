pragma solidity ^0.4.11;

/// @title Listing
/// @dev An indiviual Origin Listing representing an offer for booking/purchase

contract Listing {

  /*
   * Events
   */

  event ListingPurchased(uint _unitsToBuy, uint _value);

    /*
    * Storage
    */

    address public owner;
    address public listingRegistry; // TODO: Define interface for real ListingRegistry ?
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    // This assumption may have to change in future, but saves space now
    bytes32 public ipfsHash;
    uint public price;
    uint public unitsAvailable;


    function Listing (
      address _owner,
      bytes32 _ipfsHash,
      uint _price,
      uint _unitsAvailable
    )
    public
    {
      owner = _owner;
      listingRegistry = msg.sender; // ListingRegistry(msg.sender);
      ipfsHash = _ipfsHash;
      price = _price;
      unitsAvailable = _unitsAvailable;
    }


  /// @dev buyListing(): Buy a listing
  /// @param _unitsToBuy Number of units to buy
  function buyListing(uint _unitsToBuy)
    public
    payable
  {
    // Insure there is money to pay
    require (msg.value >= (price * _unitsToBuy));

    require (_unitsToBuy <= unitsAvailable);

    // Count units as sold
    unitsAvailable -= _unitsToBuy;

    // Send funds to lister
    // TODO: In future there will likely be some sort of escrow
    owner.transfer(msg.value);

    // TODO: this needs to call logging back on the registry
    ListingPurchased(_unitsToBuy, msg.value);
  }

}
