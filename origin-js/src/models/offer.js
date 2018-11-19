//
// Offer is the main object exposed by Origin Protocol to access offer data.
//
export class Offer {
  /**
   * Offer object model.
   *
   * @param {Object} args - single object arguments used to construct an Offer
   *  - {string} id - Offer ID.
   *  - {string} listingId - Unique listing ID.
   *  - {string} status - Status of the offer: 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed'
   *  - {int} createdAt - Time in seconds since epoch
   *  - {string} buyer - address of the buyer
   *  - {Array{Object}} events - list of events ( like OfferCreated event)
   *  - {string} refund - Amount to refund buyer upon finalization
   */
  constructor({ id, listingId, status, createdAt, buyer, events, refund, totalPrice }) {
      this.id = id
      this.listingId = listingId
      this.status = status
      this.createdAt = createdAt
      this.buyer = buyer
      this.events = events
      this.refund = refund
      this.totalPrice = totalPrice
  }

  // creates an Offer using on-chain and off-chain data
  static init(offerId, listingId, chainData) {
    return new Offer({
      id: offerId,
      listingId: listingId,
      status: chainData.status,
      createdAt: chainData.createdAt,
      buyer: chainData.buyer,
      events: chainData.events,
      refund: chainData.refund,
      totalPrice: chainData.totalPrice
    })
  }

  // creates an Offer from Discovery's Apollo schema
  static initFromDiscovery(discoveryNode) {
    return new Offer({
      id: discoveryNode.id,
      listingId: discoveryNode.listing.id,
      status: discoveryNode.status,
      createdAt: discoveryNode.data.createdAt,
      buyer: discoveryNode.buyer.walletAddress,
      events: discoveryNode.data.events,
      refund: discoveryNode.data.refund,
      totalPrice: discoveryNode.data.totalPrice
    })
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
