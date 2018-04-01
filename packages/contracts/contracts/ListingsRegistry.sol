pragma solidity ^0.4.11;

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

    // Sample Listings - May be removed for public deployment
    testingAddSampleListings();
  }

  function testingAddSampleListings()
    public
    isOwner
  {
    // We get stripped hex value from IPFS hash using getBytes32FromIpfsHash()
    // in contract-service.js

    // Zinc house - Hash: QmTfozaMrUBZdYBzPgxuSC15zBRgLCEfQmWFZwmDHYGY1e
    create(
      0x4f32f7a7d40b4d65a917926cbfd8fd521483e7472bcc4d024179735622447dc9,
      3.999 ether, 1
    );

    // Scout II - Hash: QmZD8wZWEqzKwvEtGWXzCb3MuXvmxLdCxXGHMRocQFnpoy
    create(
      0xa183d4eb3552e730c2dd3df91384426eb88879869b890ad12698320d8b88cb48,
      0.600 ether, 1
    );

    // Mamalahoa Estate - Hash: QmZtQDL4UjQWryQLjsS5JUsbdbn2B27Tmvz2gvLkw7wmmb
    create(
      0xab92c0500ba26fa6f5244f8ba54746e15dd455a7c99a67f0e8f8868c8fab4a1a,
      8.500 ether, 1
    );

    // Casa Wolf - Hash: QmVYeipL2JWFkpWsGqNNXDFUVAmPWEEK8u3Q45CZ1YrZPf
    create(
      0x6b14cac30356789cd0c39fec0acc2176c3573abdb799f3b17ccc6972ab4d39ba,
      1.500 ether, 1
    );

    // Taylor Swift - Hash: QmfXRgtSbrGggApvaFCa88ofeNQP79G18DpWaSW1Wya1u8
    create(
      0xff5957ff4035d28dcee79e65aa4124a4de4dcc8cb028faca54c883a5497d8917,
      0.300 ether, 25
    );

    // // Red shoe - Hash: QmfF4JBA4fEYDkZqjRHnDxWGGoXg5D1T4WqfDrN4GXP33p
    // create(
    //   0xfb27dcfe2c7febe98d755e2f9df0ff73fb8abecaa778f540d0cbf28b059306db,
    //   0.01 ether, 1
    // );

    // // Lambo - Hash: QmYsNo3fYTXQRHREYeoGUGLuYETnjx3HxQFMeiZuE7zPSf
    // create(
    //   0x9c73e11ffa575504295be4ece1d4ea49df33261f8eb6a4a7e313e4bb74abf150,
    //   2.50 ether, 1
    // );
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
    NewListing(listings.length-1);
    return listings.length;
  }


}
