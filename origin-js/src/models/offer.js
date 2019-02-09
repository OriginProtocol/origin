//
// Offer is the main object exposed by Origin Protocol to access offer data.
//
export class Offer {
  /**
   * Offer object model.
   *
   * Notice: when adding a field, be aware that the data in the discovery back-end
   * is not automatically re-indexed. Therefore old offers will be returned by
   * the back-end with the new field's value set to 'undefined'.
   *
   * @param {Object} args - single object arguments used to construct an Offer
   *  - {string} id - Offer ID.
   *  - {string} listingId - Unique listing ID.
   *  - {string} status - Status of the offer: 'error', 'created', 'accepted', 'disputed', 'finalized', 'sellerReviewed', 'withdrawn', 'ruling'
   *  - {int} createdAt - Time in seconds since epoch
   *  - {string} buyer - address of the buyer
   *  - {Array{Object}} events - list of events ( like OfferCreated event)
   *  - {string} refund - Amount to refund buyer upon finalization
   *  - {Object} totalPrice - Amount to refund buyer upon finalization, consists of 'amount' and 'currency' properties
   *  - {int} unitsPurchased - number of units purchased
   *  - {Object} blockInfo - information of where(when?) offer happened on the blockchain
   *  - {string} schemaId - schema used to validate the offer
   *  - {string} listingType - 'unit', 'fractional'
   *  - {Object} ipfs - ipfs offer data
   *  - {Array{Object}} - timeSlots - fractional usage time slot data
   */
  constructor({ id, listingId, status, createdAt, buyer, events, refund, totalPrice, unitsPurchased, blockInfo,
    schemaId, listingType, ipfs, commission, timeSlots, seller, verifier, listingIpfsHash, verifyTerms, acceptIpfsHash }) {
      this.id = id
      this.listingId = listingId
      this.status = status
      this.createdAt = createdAt
      this.buyer = buyer
      this.events = events
      this.refund = refund
      this.totalPrice = totalPrice
      this.unitsPurchased = unitsPurchased
      this.blockInfo = blockInfo
      this.schemaId = schemaId
      this.listingType = listingType
      this.ipfs = ipfs
      this.commission = commission
      this.timeSlots = timeSlots
      this.seller = seller
      this.verifier = verifier
      this.listingIpfsHash = listingIpfsHash
      this.verifyTerms = verifyTerms
      this.acceptIpfsHash = acceptIpfsHash
  }

  // creates an Offer using on-chain and off-chain data
  static init(offerId, listingId, chainData, ipfsData) {
    return new Offer({
      id: offerId,
      listingId: listingId,
      status: chainData.status,
      createdAt: chainData.createdAt,
      buyer: chainData.buyer,
      events: chainData.events,
      refund: chainData.refund,
      totalPrice: ipfsData.totalPrice,
      unitsPurchased: ipfsData.unitsPurchased,
      blockInfo: {
        blockNumber: chainData.blockNumber,
        logIndex: chainData.logIndex
      },
      schemaId: ipfsData.schemaId,
      listingType: ipfsData.listingType,
      ipfs: ipfsData.ipfs,
      commission: ipfsData.commission,
      timeSlots: ipfsData.timeSlots,
      seller: chainData.seller,
      listingIpfsHash: chainData.listingIpfsHash,
      verifyTerms: ipfsData.verifyTerms,
      acceptIpfsHash: chainData.acceptIpfsHash,
      verifier: chainData.verifier
    })
  }

  // creates an Offer from Discovery's Apollo schema
  static initFromDiscovery(discoveryNode) {
    const offerCreatedEvents = discoveryNode.data.events.filter(event => event.event === 'OfferCreated')

    if (offerCreatedEvents.length === 0)
      throw new Error('Can not find OfferCreated event required to create an Offer object')

    return new Offer({
      id: discoveryNode.id,
      listingId: discoveryNode.listing.id,
      status: discoveryNode.status,
      createdAt: discoveryNode.data.createdAt,
      buyer: discoveryNode.buyer.walletAddress,
      events: discoveryNode.data.events,
      refund: discoveryNode.data.refund,
      totalPrice: discoveryNode.data.totalPrice,
      unitsPurchased: discoveryNode.data.unitsPurchased,
      blockInfo: {
        blockNumber: offerCreatedEvents[0].blockNumber,
        logIndex: offerCreatedEvents[0].logIndex
      },
      schemaId: discoveryNode.data.schemaId,
      listingType: discoveryNode.data.listingType,
      ipfs: discoveryNode.data.ipfs,
      // See https://github.com/OriginProtocol/origin/issues/1087
      // as to why we extract commission from the ipfs data.
      commission: discoveryNode.data.ipfs.data.commission,
      timeSlots: discoveryNode.data.ipfs.data.timeSlots,
      verifier:  discoveryNode.data.verifier,
      verifyTerms:  discoveryNode.data.verifyTerms,
      acceptIpfsHash: discoveryNode.data.acceptIpfsHash,
      listingIpfsHash:  discoveryNode.data.listingIpfsHash
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
