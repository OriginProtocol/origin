pragma solidity 0.4.23;

/// @title Listing
/// @dev Used to keep marketplace of listings for buyers and sellers
/// @author Matt Liu <matt@originprotocol.com>, Josh Fraser <josh@originprotocol.com>, Stan James <stan@originprotocol.com>

import "./UnitListing.sol";
import "./FractionalListing.sol";
import "./ListingsRegistryStorage.sol";

contract ListingsRegistry {

  /*
   * Events
   */

  event NewListing(uint _index, address _address);

  /*
   * Storage
   */

  address public owner;

  ListingsRegistryStorage public listingStorage;

  /*
   * Public functions
   */

  constructor(ListingsRegistryStorage _listingStorage)
    public
  {
    // Defines origin admin address - may be removed for public deployment
    owner = msg.sender;
    listingStorage = _listingStorage;
  }

  /// @dev listingsLength(): Return number of listings
  function listingsLength()
    public
    constant
    returns (uint)
  {
      return listingStorage.length();
  }

  /// @dev getListingAddress(): Return listing address
  /// @param _index the index of the listing
  function getListingAddress(uint _index)
    public
    constant
    returns (address)
  {
    return listingStorage.listings(_index);
  }

  /// @dev create(): Create a new listing
  /// @param _ipfsHash Hash of data on ipfsHash
  /// @param _price Price of unit in wei
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
    Listing newListing = new UnitListing(msg.sender, _ipfsHash, _price, _unitsAvailable);
    listingStorage.add(newListing);
    emit NewListing((listingStorage.length())-1, address(newListing));
    return listingStorage.length();
  }

  /// @dev createFractional(): Create a new fractional listing
  /// @param _ipfsHash Hash of data on ipfsHash
  function createFractional(
    bytes32 _ipfsHash
  )
    public
    returns (uint)
  {
    Listing newListing = new FractionalListing(msg.sender, _ipfsHash);
    listingStorage.add(newListing);
    emit NewListing((listingStorage.length())-1, address(newListing));
    return listingStorage.length();
  }

  /// @dev createOnBehalf(): Create a new listing with specified creator
  ///                        Used for migrating from old contracts (admin only)
  /// @param _ipfsHash Hash of data on ipfsHash
  /// @param _price Price of unit in wei
  /// @param _unitsAvailable Number of units availabe for sale at start
  /// @param _creatorAddress Address of account to be the creator
  function createOnBehalf(
    bytes32 _ipfsHash,
    uint _price,
    uint _unitsAvailable,
    address _creatorAddress
  )
    public
    returns (uint)
  {
    require (msg.sender == owner, "Only callable by registry owner");
    Listing newListing = new UnitListing(_creatorAddress, _ipfsHash, _price, _unitsAvailable);
    listingStorage.add(newListing);
    emit NewListing(listingStorage.length()-1, address(newListing));
    return listingStorage.length();
  }

  // @dev isTrustedListing(): Checks to see if a listing belongs to
  //                          this registry, and thus trusting that
  //                          it was created with good bytecode and
  //                          the proper initialization was completed.
  function isTrustedListing(
    address _listingAddress
  )
    public
    view
    returns(bool)
  {
    return listingStorage.isTrustedListing(_listingAddress);
  }
}
