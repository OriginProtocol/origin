pragma solidity 0.4.23;

/// @title Listing
/// @dev An indiviual Origin Listing representing an offer for booking/purchase

import "./Purchase.sol";


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
    uint public created;
    uint public expiration;
    bool public needsSellerApproval;

    Purchase[] public purchases;

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

  modifier hasNotExpired() {
    require(now < expiration);
    _;
  }

  /*
    * Public functions
  */

  /// @dev purchasesLength(): Return number of purchases for a given listing
  function purchasesLength()
    public
    constant
    returns (uint)
  {
      return purchases.length;
  }

  /// @dev getPurchase(): Return purchase info for a given listing
  /// @param _index the index of the listing we want info about
  function getPurchase(uint _index)
    public
    constant
    returns (Purchase)
  {
    return (
      purchases[_index]
    );
  }

  /*
    * Abstract methods
  */

  function ipfsHash() public view returns (bytes32 _ipfsHash);
  function isApproved(Purchase _purchase) public view returns (bool);
  function currentVersion() public constant returns (uint);

}
