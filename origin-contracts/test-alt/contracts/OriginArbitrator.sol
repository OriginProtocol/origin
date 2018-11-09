pragma solidity ^0.4.24;

/**
 * @title A Marketplace contract for managing listings, offers, payments, escrow and arbitration
 * @author Nick Poulden <nick@poulden.com>
 *
 * Listings may be priced in Eth or ERC20.
 */

import './arbitration/Arbitrable.sol';

contract Marketplace {
  function executeRuling(uint listingID, uint offerID, uint _ruling, uint _refund) public;
}

contract OriginArbitrator is Arbitrable {

  struct DisputeMap {
    uint listingID;
    uint offerID;
    uint refund;
    address marketplace;
  } // Maps back from disputeID to listing + offer
  mapping(uint => DisputeMap) public disputes; // disputeID => DisputeMap

  Arbitrator public arbitrator; // Address of arbitration contract

  constructor(Arbitrator _arbitrator) Arbitrable(_arbitrator, "", "") public {
    arbitrator = Arbitrator(_arbitrator);
  }

  function createDispute(uint listingID, uint offerID, uint refund) public returns (uint) {
    uint disputeID = arbitrator.createDispute(3, '0x00'); // 4 choices

    disputes[disputeID] = DisputeMap({
      listingID: listingID,
      offerID: offerID,
      marketplace: msg.sender,
      refund: refund
    });
    emit Dispute(arbitrator, disputeID, "Buyer wins;Seller wins");
    return disputeID;
  }

  // @dev Called from arbitration contract
  function executeRuling(uint _disputeID, uint _ruling) internal {
    DisputeMap storage dispute = disputes[_disputeID];
    Marketplace marketplace = Marketplace(dispute.marketplace);

    marketplace.executeRuling(
      dispute.listingID,
      dispute.offerID,
      _ruling,
      dispute.refund
    );

    delete disputes[_disputeID]; // Save some gas by deleting dispute
  }
}
