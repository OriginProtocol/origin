pragma solidity 0.4.23;

/// @title Purchase
/// @dev An purchase Origin Listing representing a purchase/booking
import "./Purchase.sol";
import "./Listing.sol";


contract UnitPurchase is Purchase {

  /*
  * Storage
  */

  Listing public listingContract; // listing that is being purchased

  /*
  * Modifiers
  */

  modifier isSeller() {
    require(msg.sender == listingContract.owner());
    _;
  }

  modifier isBuyer() {
    require(msg.sender == buyer);
    _;
  }

  /*
  * Public functions
  */

  constructor(
    address _listingContractAddress,
    address _buyer
  )
  public
  {
    buyer = _buyer;
    listingContract = Listing(_listingContractAddress);
    created = now;
    emit PurchaseChange(internalStage);
  }

  function data()
  public
  view
  returns (Stages _stage, Listing _listingContract, address _buyer, uint _created, uint _buyerTimeout) {
      return (stage(), listingContract, buyer, created, buyerTimeout);
  }

  // Pay for listing
  // We used to limit this to buyer, but that prevents Listing contract from
  // paying
  function pay()
  public
  payable
  atStage(Stages.AWAITING_PAYMENT)
  {
    if (listingContract.isPaymentSufficient(address(this).balance)) {
      // Buyer (or their proxy) has paid enough to cover purchase
      setStage(Stages.SHIPPING_PENDING);
    }
    // Possible that nothing happens, and contract just accumulates sent value
  }

  function sellerConfirmShipped()
  public
  isSeller
  atStage(Stages.SHIPPING_PENDING)
  {
      buyerTimeout = now + 21 days;
      setStage(Stages.BUYER_PENDING);
  }

  function buyerConfirmReceipt(uint8 _rating, bytes32 _ipfsHash)
  public
  isBuyer
  atStage(Stages.BUYER_PENDING)
  {
    // Checks
    require(_rating >= 1);
    require(_rating <= 5);

    // State changes
    setStage(Stages.SELLER_PENDING);

    // Events
    emit PurchaseReview(buyer, listingContract.owner(), Roles.SELLER, _rating, _ipfsHash);
  }

  function sellerCollectPayout(uint8 _rating, bytes32 _ipfsHash)
  public
  isSeller
  atStage(Stages.SELLER_PENDING)
  {
    // Checks
    require(_rating >= 1);
    require(_rating <= 5);

    // State changes
    setStage(Stages.COMPLETE);

    // Events
    emit PurchaseReview(listingContract.owner(), buyer, Roles.BUYER, _rating, _ipfsHash);

    // Transfers
    // Send contract funds to seller (ie owner of Listing)
    // Transfering money always needs to be the last thing we do, do avoid
    // rentrancy bugs. (Though here the seller would just be getting their own money)
    listingContract.owner().transfer(address(this).balance);
  }

  function openDispute()
  public
  {
    // Must be buyer or seller
    require(
      (msg.sender == buyer) ||
      (msg.sender == listingContract.owner())
    );

    // Must be in a valid stage
    require(
      (stage() == Stages.BUYER_PENDING) ||
      (stage() == Stages.SELLER_PENDING)
    );

    setStage(Stages.IN_DISPUTE);

    // TODO: Create a dispute contract?
    // Right now there's no way to exit this state.
  }
}
