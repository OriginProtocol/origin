//
// Offer is the main object exposed by Origin Protocol to access offer data.
//
export class Offer {
  /**
   * The same offer object constructed by origin-js and discovery server. Ideally we would have
   * separate constructors but JavaScript does not support that. For that reason this 2 mode 
   * constructor paradigm is used
   *
   * @param {Object} originJsData - Constructor argument used by marketplace resource
   * - {string} offerId - Unique offer ID.
   * - {string} listingId - Unique listing ID.
   * - {Object} chainOffer - Offer data from the blockchain.
   * - {Object} ipfsOffer - Offer data from IPFS.
   * @param {Object} discoveryData - Constructor argument used by discovery-service
   */
  constructor(
    originJsData,
    discoveryData
  ) {
    if (originJsData && discoveryData)
      throw 'Only one of constructor parameters should be present'

    if (originJsData) {
      const { offerId, listingId, chainOffer, ipfsOffer } = originJsData

      this.id = offerId
      this.listingId = listingId
      this.status = chainOffer.status // 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed'
      this.createdAt = chainOffer.createdAt // Time in seconds since epoch.
      this.buyer = chainOffer.buyer
      this.events = chainOffer.events
      this.refund = chainOffer.refund

      // See src/schemas/offer.json for fields stored in IPFS offer data.
      Object.assign(this, ipfsOffer)
    } else {
      const { offerId, listingId, status, buyerAddress, discoveryData } = originJsData
      this.id = offerId
      this.listingId = listingId
      this.status = status // 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed'
      this.createdAt = discoveryData.createdAt // Time in seconds since epoch.
      this.buyer = buyerAddress
      this.events = discoveryData.events
      this.refund = discoveryData.refund
    }
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
