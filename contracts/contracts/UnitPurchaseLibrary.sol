pragma solidity 0.4.23;

/// @title PurchaseLibrary
/// @dev An collection of helper tools for a purchase

import "./Purchase.sol";
import "./UnitListing.sol";

library UnitPurchaseLibrary {

    function newPurchase(UnitListing listing, address _buyer)
    public
    returns (Purchase purchase)
    {
        purchase = new Purchase(listing, _buyer);
    }

}
