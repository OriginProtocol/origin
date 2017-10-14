pragma solidity ^0.4.2;

/// @title Listing
/// @dev Used to keep marketplace of listings for buyers and sellers
/// @author Matt Liu <matt@0rigin.org>, Josh Fraser <josh@0rigin.org>, Stan James <stan@wanderingstan.com>

contract Listing {

  /*
   * Events
   */

  // Event denoting that a given address has updated its array of listings
  // Currently, this means creating or deleting listings
  // In the future, we will have separate events for specific actions
  event UpdateListings(address from);


  /*
   * Storage
   */

  // 0rigin owner
  address public origin;

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
   * Public functions
   */

  // Defines origin admin address - may be removed for public deployment
  function Listing()
  {
    origin = msg.sender;
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
    return listings.length;
  }

}
