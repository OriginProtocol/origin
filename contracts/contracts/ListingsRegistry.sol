pragma solidity 0.4.21;

/// @title Listing
/// @dev Used to keep marketplace of listings for buyers and sellers
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

import "./Listing.sol";

contract ListingsRegistry {

  /*
   * Events
   */

  event NewListing(uint _index);

  /*
   * Storage
   */

  // Contract owner
  address public owner;

  // Array of all listings
  Listing[] public listings;


  /*
   * Modifiers
   */
  modifier isValidListingIndex(uint _index) {
    require (_index < listings.length);
    _;
  }


  modifier isOwner() {
    require (msg.sender == owner);
    _;
  }


  /*
   * Public functions
   */

  function ListingsRegistry()
    public
  {
    // Defines origin admin address - may be removed for public deployment
    owner = msg.sender;
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
    returns (Listing, address, bytes32, uint, uint)
  {
    // Test in truffle deelop:
    // ListingsRegistry.deployed().then(function(instance){ return instance.getListing.call(0) })

    // TODO (Stan): Determine if less gas to do one array lookup into var, and
    // return var struct parts
    return (
      listings[_index],
      listings[_index].owner(),
      listings[_index].ipfsHash(),
      listings[_index].price(),
      listings[_index].unitsAvailable()
    );
  }

  /// @dev create(): Create a new listing
  /// @param _ipfsHash Hash of data on ipfsHash
  /// @param _price Price of unit. Currently ETH, will change to 0T
  /// @param _unitsAvailable Number of units availabe for sale at start
  ///
  /// Sample Remix invocation:
  /// ["0x01","0x7d","0xfd","0x85","0xd4","0xf6","0xcb","0x4d","0xcd","0x71","0x5a","0x88","0x10","0x1f","0x7b","0x1f","0x06","0xcd","0x1e","0x00","0x9b","0x23","0x27","0xa0","0x80","0x9d","0x01","0xeb","0x9c","0x91","0xf2","0x31"],"3140000000000000000",42
  function create(
    bytes32 _ipfsHash,
    uint _price,
    uint _unitsAvailable
  )
    public
    returns (uint)
  {
    listings.push(new Listing(msg.sender, _ipfsHash, _price, _unitsAvailable));
    emit NewListing(listings.length-1);
    return listings.length;
  }


}
