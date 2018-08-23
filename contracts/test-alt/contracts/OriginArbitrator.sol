pragma solidity ^0.4.24;

/**
 * @title A Marketplace contract for managing listings, offers, payments, escrow and arbitration
 * @author Nick Poulden <nick@poulden.com>
 *
 * Listings may be priced in Eth or ERC20.
 */

import './arbitration/Arbitrable.sol';

contract Marketplace {
  function executeRuling(uint listingID, uint offerID, uint _ruling) public;
}

contract OriginArbitrator is Arbitrable {

  struct DisputeMap {
    uint listingID;
    uint offerID;
    address marketplace;
  } // Maps back from disputeID to listing + offer
  mapping(uint => DisputeMap) public disputes; // disputeID => DisputeMap

  Arbitrator public arbitrator; // Address of arbitration contract

  constructor(Arbitrator _arbitrator) Arbitrable(_arbitrator, "", "") public {
    arbitrator = Arbitrator(_arbitrator);
  }

  function createDispute(uint listingID, uint offerID) public returns (uint) {
    uint disputeID = arbitrator.createDispute(1, '0x00');

    disputes[disputeID] = DisputeMap({
      listingID: listingID,
      offerID: offerID,
      marketplace: msg.sender
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
      _ruling
    );

    delete disputes[_disputeID]; // Save some gas by deleting dispute
  }
}
