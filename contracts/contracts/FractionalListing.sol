pragma solidity 0.4.23;

import "./Listing.sol";

contract FractionalListing is Listing {

  /*
   * Events
   */

  event ListingPurchased(Purchase _purchaseContract);

  /*
  * Storage
  */

  Purchase[] public purchases;
  bytes32[] public ipfsHashes;


  constructor (
    address _owner,
    bytes32 _ipfsHash
  )
  public
  {
    owner = _owner;
    listingRegistry = msg.sender; // ListingRegistry(msg.sender);
    ipfsHashes.push(_ipfsHash);
    created = now;
    expiration = created + 60 days;
    needsSellerApproval = true;
  }

  /*
    * Public functions
  */

  function isApproved(Purchase _purchase)
    public
    view
    returns (bool)
  {
    return false;
  }

  function ipfsHash()
    public
    constant
    returns (bytes32)
  {
    return ipfsHashes[ipfsHashes.length - 1];
  }

  function updateIpfsHash(bytes32 _prevIpfsHash, bytes32 _ipfsHash)
    public
    isSeller
  {
    if (_prevIpfsHash == ipfsHash()) {
      ipfsHashes.push(_ipfsHash);
      emit ListingChange();
    }
  }

}
