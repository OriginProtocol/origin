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
    // FIXME: as opposed to assign, pick what specific fields to return.
    Object.assign(this, ipfsOffer, chainOffer)
  }
}
