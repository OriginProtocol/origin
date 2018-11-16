//
// Offer is the main object exposed by Origin Protocol to access offer data.
//
export class Offer {
  /**
   * Offer object model.
   *
   * @param {string} id - Offer ID.
   * @param {string} listingId - Unique listing ID.
   * @param {string} status - Satus of the offer: 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed'
   * @param {int} createdAt - Time in seconds since epoch
   * @param {string} buyer - address of the buyer
   * @param {Array{Object}} events - list of events ( like OfferCreated event)
   * @param {string} refund - Amount to refund buyer upon finalization
   */
  constructor(id, listingId, status, createdAt, buyer, events, refund, totalPrice) {
      this.id = id
      this.listingId = listingId
      this.status = status
      this.createdAt = createdAt
      this.buyer = buyer
      this.events = events
      this.refund = refund
      this.totalPrice = totalPrice
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
