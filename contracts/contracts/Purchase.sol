pragma solidity 0.4.23;


contract Purchase {

  /*
  * Events
  */

  event PurchaseChange(Stages stage);
  event PurchaseReview(address reviewer, address reviewee, Roles revieweeRole, uint8 rating, bytes32 ipfsHash);

  /*
  * Enum
  */

  enum Stages {
    AWAITING_PAYMENT, // Buyer hasn't paid full amount yet
    SHIPPING_PENDING, // Waiting for the seller to ship
    BUYER_PENDING, // Waiting for buyer to confirm receipt
    SELLER_PENDING, // Waiting for seller to confirm all is good
    IN_DISPUTE, // We are in a dispute
    REVIEW_PERIOD, // Time for reviews (only when transaction did not go through)
    COMPLETE // It's all over
  }

  enum Roles {
    BUYER,
    SELLER
  }

  /*
  * Storage
  */

  Stages internal internalStage = Stages.AWAITING_PAYMENT;

  address public buyer; // User who is buying. Seller is derived from listing
  uint public created;
  uint public buyerTimeout;

  /*
  * Modifiers
  */

  modifier atStage(Stages _stage) {
    require(stage() == _stage);
    _;
  }

  /*
  * Public functions
  */

  function stage()
  public
  view
  returns (Stages _stage)
  {
    if (internalStage == Stages.BUYER_PENDING) {
      if (now > buyerTimeout) {
        return Stages.SELLER_PENDING;
      }
    }
    return internalStage;
  }

  function setStage(Stages _stage)
  internal
  {
    internalStage = _stage;
    emit PurchaseChange(_stage);
  }
}
