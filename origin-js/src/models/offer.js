//
// Offer is the main object exposed by Origin Protocol to access offer data.
//
export class Offer {
  /**
   * An Offer is constructed based on its on-chain and off-chain data.
   * @param {string} offerId - Unique offer ID.
   * @param {string} listingId - Unique listing ID.
   * @param {Object} chainOffer - Offer data from the blockchain.
   * @param {Object} ipfsOffer - Offer data from IPFS.
   */
  constructor(offerId, listingId, chainOffer, ipfsOffer) {
    this.id = offerId
    this.listingId = listingId
    this.status = chainOffer.status // 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed'
    this.createdAt = chainOffer.createdAt // Time in seconds since epoch.
    this.buyer = chainOffer.buyer
    this.events = chainOffer.events
    this.refund = chainOffer.refund
    this.blockInfo = {
      blockNumber: chainOffer.blockNumber,
      logIndex: chainOffer.logIndex
    }

    // See src/schemas/offer.json for fields stored in IPFS offer data.
    Object.assign(this, ipfsOffer)
  }

  /**
   * Gets an event based on its name.
   * @param {string} name - Event name, as emitted by marketplace contract. Ex: 'OfferCreated'.
   * @return First event object found matching the name or undefined.
   */
  event(name) {
    return this.events.find(l => l.event === name)
  }
}
