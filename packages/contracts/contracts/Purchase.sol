pragma solidity ^0.4.11;

/// @title Purchase
/// @dev An purchase Origin Listing representing a purchase/booking
import "./Listing.sol";

contract Purchase {

  enum Stages {
    AWAITING_PAYMENT, // Buyer hasn't paid full amount yet
    BUYER_PENDING, // Waiting for buyer to confirm receipt
    SELLER_PENDING, // Waiting for seller to confirm all is good
    IN_DISPUTE, // We are in a dispute
    REVIEW_PERIOD, // Time for reviews (only when transaction did not go through)
    COMPLETE // It's all over
  }

  /*
  * Storage
  */

  Stages public stage = Stages.AWAITING_PAYMENT;

  Listing listingContract; // listing that is being purchased
  address public buyer; // User who is buying. Seller is derived from listing
  uint created;

  /*
  * Modifiers
  */

  modifier isSeller() {
    require (msg.sender == listingContract.owner());
    _;
  }

  modifier isBuyer() {
    require (msg.sender == buyer);
    _;
  }

  modifier atStage(Stages _stage) {
    require(stage == _stage);
    _;
  }

  /*
  * Public functions
  */

  function Purchase(
    address _listingContractAddress
  )
  public
  {
    buyer = msg.sender;
    listingContract = Listing(_listingContractAddress);
    created = now;
  }


  function buyerPay()
  public
  payable
  isBuyer
  atStage(Stages.AWAITING_PAYMENT)
  {
    if (this.balance >= listingContract.price()) {

      // Buyer has paid enough to cover purchase
      stage = Stages.BUYER_PENDING;

      // Mark item as no longer available for sale in Listing
      // TODO: presumable we call function on Listing(), proving that we have the funds to cover purchase.
    }
  }


  function buyerConfirmReceipt()
  isBuyer
  public
  atStage(Stages.BUYER_PENDING)
  {
      stage = Stages.SELLER_PENDING;
  }


  function getPayout()
  public
  isSeller
  atStage(Stages.SELLER_PENDING)
  {
    // Send contract funds to seller (ie owner of Listing)
    listingContract.owner().transfer(this.balance);

      stage = Stages.COMPLETE;
  }


  function openDisute()
  public
  {
    // Must be buyer or seller
    require (
      (msg.sender == buyer) ||
      (msg.sender == listingContract.owner())
    );

    // Must be in a valid stage
    require(
      (stage == Stages.BUYER_PENDING) ||
      (stage == Stages.SELLER_PENDING)
    );

    stage = Stages.IN_DISPUTE;

    // TODO: Create a dispute contract?
    // Right now there's no way to exit this state.
  }
}

