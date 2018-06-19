pragma solidity 0.4.23;

import "./Listing.sol";
import "./UnitPurchaseLibrary.sol";

contract UnitListing is Listing {

  /*
   * Events
   */

  event ListingPurchased(UnitPurchase _purchaseContract);

  /*
  * Storage
  */

  uint public price;
  uint public unitsAvailable;
  UnitPurchase[] public purchases;


  constructor (
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
    created = now;
    expiration = created + 60 days;
  }

  /*
    * Public functions
  */

  function data()
    public
    view
    returns (address _owner, bytes32 _ipfsHash, uint _price, uint _unitsAvailable, uint _created, uint _expiration)
  {
    return (owner, ipfsHash, price, unitsAvailable, created, expiration);
  }

  /// @dev buyListing(): Buy a listing
  /// @param _unitsToBuy Number of units to buy
  function buyListing(uint _unitsToBuy)
    public
    payable
    isNotSeller
  {
    // Ensure that this is not trying to purchase more than is available.
    require(_unitsToBuy <= unitsAvailable);

    // Ensure that we are not past the expiration
    require(now < expiration);

    // Create purchase contract
    UnitPurchase purchaseContract = UnitPurchaseLibrary.newPurchase(this, msg.sender);

    // Count units as sold
    unitsAvailable -= _unitsToBuy;

    purchases.push(purchaseContract);

    // TODO STAN: How to call function *AND* transfer value??
    purchaseContract.pay.value(msg.value)();

    emit ListingPurchased(purchaseContract);
    emit ListingChange();
  }

  /// @dev close(): Allows a seller to close the listing from further purchases
  function close()
    public
    isSeller
  {
    unitsAvailable = 0;
    emit ListingChange();
  }

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
    returns (UnitPurchase)
  {
    return (
      purchases[_index]
    );
  }

  function isPaymentSufficient(uint256 balance)
    public
    view
    returns (bool)
  {
    return balance >= price;
  }

}
