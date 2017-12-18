pragma solidity ^0.4.11;

/// @title Listing
/// @dev Used to keep marketplace of listings for buyers and sellers
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

contract Listing {

  /*
   * Events
   */

  // Event denoting that a given address has updated its array of listings
  // Currently, this means creating or deleting listings
  // In the future, we will have separate events for specific actions
  event UpdateListings(address _from);
  event NewListing(uint _index);
  event ListingPurchased(uint _index, uint _unitsToBuy, uint _value);

  /*
   * Storage
   */

  // Contract owner
  address public owner_address;

  // Array of all listings
  listingStruct[] public listings;


  /*
   * Structs
   */

  struct listingStruct {
    address lister;
    // Assume IPFS defaults for hash: function:0x12=sha2, size:0x20=256 bits
    // See: https://ethereum.stackexchange.com/a/17112/20332
    // This assumption may have to change in future, but saves space now
    bytes32 ipfsHash;
    uint price;
    uint unitsAvailable;
  }


  /*
   * Modifiers
   */
  modifier isValidListingIndex(uint _index) {
    require (_index < listings.length);
    _;
  }

  modifier hasUnitsAvailable(uint _index, uint _unitsToBuy) {
    require (_unitsToBuy <= listings[_index].unitsAvailable);
    _;
  }

  modifier hasValueToPurchase(uint _index, uint _unitsToBuy) {
    require (msg.value >= (listings[_index].price * _unitsToBuy));
    _;
  }

  modifier isOwner() {
    require (msg.sender == owner_address);
    _;
  }


  /*
   * Public functions
   */

  function Listing()
  {
    // Defines origin admin address - may be removed for public deployment
    owner_address = msg.sender;

    // Sample Listings - May be removed for public deployment
    testingAddSampleListings();
  }

  function testingStringToBytes32(string memory source)
    public
    constant
    returns (bytes32 result)
  {
      bytes memory tempEmptyStringTest = bytes(source);
      if (tempEmptyStringTest.length == 0) {
          return 0x0;
      }
      assembly {
          result := mload(add(source, 32))
      }
  }

  function testingAddSampleListings()
    isOwner
  {
    // Red shoe
    create(testingStringToBytes32('QmfF4JBA4fEYDkZqjRHnDxWGGoXg5D1T4WqfDrN4GXP33p'), 0.01 ether, 1);
    // Lambo
    create(testingStringToBytes32('QmYsNo3fYTXQRHREYeoGUGLuYETnjx3HxQFMeiZuE7zPSf'), 2.50 ether, 1);
  }

  /// @dev listingsLength(): Return number of listings
  function listingsLength()
    public
    constant
    returns (uint)
  {
      return listings.length;
  }

  /// @dev getListing(): Return listing info for given listing
  /// @param _index the index of the listing we want info about
  function getListing(uint _index)
    public
    constant
    returns (uint, address, bytes32, uint, uint)
  {
    // TODO (Stan): Determine if less gas to do one array lookup into var, and
    // return var struct parts
    return (
      _index,
      listings[_index].lister,
      listings[_index].ipfsHash,
      listings[_index].price,
      listings[_index].unitsAvailable
    );
  }

  /// @dev create(): Create a new listing
  /// @param _ipfsHash Hash of data on ipfsHash
  /// @param _price Price of unit. Currently ETH, will change to 0T
  /// @param _unitsAvailable Number of units availabe for sale at start
  function create(
    bytes32 _ipfsHash,
    uint _price,
    uint _unitsAvailable
  )
    public
    returns (uint)
  {
    listings.push(listingStruct(msg.sender, _ipfsHash, _price, _unitsAvailable));
    UpdateListings(msg.sender);
    NewListing(listings.length-1);
    return listings.length;
  }


  /// @dev buyListing(): Buy a listing
  /// @param _index Index of listing to buy
  /// @param _unitsToBuy Number of units to buy
  function buyListing(uint _index, uint _unitsToBuy)
    public
    payable
    isValidListingIndex(_index)
    hasUnitsAvailable(_index, _unitsToBuy)
    hasValueToPurchase(_index, _unitsToBuy)
  {
    // Count units as sold
    listings[_index].unitsAvailable -= _unitsToBuy;

    // Send funds to lister
    // TODO: In future there will likely be some sort of escrow
    listings[_index].lister.transfer(msg.value);

    ListingPurchased(_index, _unitsToBuy, msg.value);
  }

}
