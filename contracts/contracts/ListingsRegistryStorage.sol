pragma solidity 0.4.23;


// ListingsRegistryStorage provides long term storage for the replacable
// ListingRegistry.
//
// This ListingsRegistryStorage provides only the ability to add new Listing
// contracts to storage. There is no provision for deleting them.
contract ListingsRegistryStorage {

  /*
  * Events
  */

  event RegistryChange(address registryAddress);

  /*
  * Storage
  */

  address public owner;
  address public activeRegistry;
  address[] public listings;
  mapping(address => bool) public listingsMap;

  /*
  * Modifiers
  */

  modifier isOwner() {
    require(msg.sender == owner);
    _;
  }

  modifier isRegistryOrOwner() {
    require(
      msg.sender == activeRegistry || msg.sender == owner
    );
    _;
  }

  /*
  * Methods
  */

  constructor()
    public
  {
    owner = msg.sender;
  }

  /*
  * Ownership Methods
  */

  function setOwner(address _owner)
    public
    isOwner()
  {
    owner = _owner;
  }

  function setActiveRegistry(address _newRegistry)
    public
    isRegistryOrOwner()
  {
    activeRegistry = _newRegistry;
    emit RegistryChange(activeRegistry);
  }

  /*
  * Listing Storage Methods
  */

  function add(address _listingAddress)
    public
    isRegistryOrOwner()
    returns (uint)
  {
    listings.push(_listingAddress);
    listingsMap[_listingAddress] = true;
    return (listings.length-1);
  }

  function length()
    public
    view
    returns (uint)
  {
    return listings.length;
  }

  function isTrustedListing(address _listingAddress)
    public
    view
    returns (bool)
  {
    return listingsMap[_listingAddress];
  }
}
