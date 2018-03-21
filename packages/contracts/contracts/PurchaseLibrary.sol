pragma solidity ^0.4.11;

/// @title PurchaseLibrary
/// @dev An collection of helper tools for a purchase

import "./Purchase.sol";
import "./Listing.sol";

library PurchaseLibrary {

    function newPurchase(Listing listing, address _buyer)
    public
    returns (Purchase purchase)
    {
        purchase = new Purchase(listing, _buyer);
    }
    
}