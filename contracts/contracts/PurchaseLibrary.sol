pragma solidity 0.4.23;

/// @title PurchaseLibrary
/// @dev An collection of helper tools for a purchase

import "./Purchase.sol";
import "./Listing.sol";

library PurchaseLibrary {

    function newPurchase(Listing _listing, uint _listingVersion, address _buyer)
    public
    returns (Purchase purchase)
    {
        purchase = new Purchase(_listing, _listingVersion, _buyer);
    }

}
