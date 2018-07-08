pragma solidity 0.4.23;

import "./Listing.sol";
import "./PurchaseLibrary.sol";

contract UnitListing is Listing {

  /*
   * Events
   */

  event ListingPurchased(Purchase _purchaseContract);

  /*
  * Storage
  */

  uint public price;
  uint public unitsAvailable;
  bytes32 public ipfsHash;


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
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    // This assumption may have to change in future, but saves space now
    ipfsHash = _ipfsHash;
    price = _price;
    unitsAvailable = _unitsAvailable;
    created = now;
    expiration = created + 60 days;
    needsSellerApproval = false;
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
    hasNotExpired
  {
    // Ensure that this is not trying to purchase more than is available.
    require(_unitsToBuy <= unitsAvailable);

    // Create purchase contract
    Purchase purchaseContract = PurchaseLibrary.newPurchase(this, currentVersion(), 0x0000000000000000000000000000000000000000000000000000000000000000, msg.sender);

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

  function isApproved(Purchase _purchase)
    public
    view
    returns (bool)
  {
    return address(_purchase).balance >= price;
  }

  function currentVersion()
    public
    constant
    returns (uint)
  {
    // hard-coded for now as we're not yet supporting edits for unit listings
    return 0;
  }

  function ipfsHash()
    public
    constant
    returns (bytes32)
  {
    return ipfsHash;
  }
}
