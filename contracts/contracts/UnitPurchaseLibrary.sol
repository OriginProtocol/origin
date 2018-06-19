pragma solidity 0.4.23;

/// @title PurchaseLibrary
/// @dev An collection of helper tools for a purchase

import "./UnitPurchase.sol";
import "./UnitListing.sol";

library UnitPurchaseLibrary {

    function newPurchase(UnitListing listing, address _buyer)
    public
    returns (UnitPurchase purchase)
    {
        purchase = new UnitPurchase(listing, _buyer);
    }

}
