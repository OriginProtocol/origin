//
// Listing is the main object exposed by Origin Protocol to access listing data.
//
export class Listing {
  /**
   * Listing object model.
   *
   * @param {Object} args - single object arguments used to construct a Listing
   *  - {string} id
   *  - {string} title
   *  - {string} description
   *  - {string} category
   *  - {Object} commission - consists of 'amount' and 'currency' properties
   *  - {string} subCategory
   *  - {string} status - 'active', 'inactive'
   *  - {string} type - 'unit', 'fractional'
   *  - {int} unitsTotal
   *  - {Object} offers
   *  - {Array<Object>} events
   *  - {string} ipfsHash
   *  - {Object} ipfs
   *  - {string} language
   *  - {Object} price - consists of 'amount' and 'currency' properties
   *  - {string} seller - address of the seller
   *  - {string} display - 'normal', 'featured', 'hidden'
   *  - {Array<Object>} media
   *  - {Object} comission - consists of 'amount' and 'currency' properties
   *  - {Array} slots - to be implemented
   */
  constructor({ id, title, display, description, category, subCategory, status, type, media,
    unitsTotal, offers, events, ipfs, ipfsHash, language, price, seller, commission, slots }) {

    this.id = id
    this.title = title
    this.description = description
    this.category = category
    this.subCategory = subCategory
    this.status = status
    this.type = type
    this.unitsTotal = unitsTotal
    this.offers = offers
    this.events = events
    this.ipfs = ipfs
    this.ipfsHash = ipfsHash
    this.language = language
    this.price = price
    this.seller = seller
    this.display = display
    this.media = media
    this.commission = commission
    this.slots = slots
  }

  // creates a Listing using on-chain and off-chain data
  static init(id, chainListing, ipfsListing) {
    return new Listing({
      id: id,
      title: ipfsListing.title,
      description: ipfsListing.description,
      category: ipfsListing.category,
      subCategory: ipfsListing.subCategory,
      status: chainListing.status,
      type: ipfsListing.type,
      unitsTotal: ipfsListing.unitsTotal,
      offers: chainListing.offers,
      events: chainListing.events,
      ipfs: ipfsListing.ipfs,
      ipfsHash: chainListing.ipfsHash,
      language: ipfsListing.language,
      price: ipfsListing.price,
      seller: chainListing.seller,
      // hidden/featured listings information is supplied only by discovery server
      display: 'normal',
      media: ipfsListing.media,
      commission: ipfsListing.commission,
      slots: [] // To be implemented
    })
  }

  // creates a Listing from Discovery's Apollo schema
  static initFromDiscovery(discoveryNodeData) {
    return new Listing({
      id: discoveryNodeData.id,
      title: discoveryNodeData.title,
      description: discoveryNodeData.description,
      category: discoveryNodeData.category,
      subCategory: discoveryNodeData.subCategory,
      status: discoveryNodeData.status,
      type: discoveryNodeData.type,
      unitsTotal: discoveryNodeData.unitsTotal,
      offers: discoveryNodeData.offers,
      events: discoveryNodeData.events,
      ipfs: discoveryNodeData.ipfs,
      ipfsHash: discoveryNodeData.ipfsHash,
      language: discoveryNodeData.language,
      price: discoveryNodeData.price,
      seller: discoveryNodeData.seller,
      display: discoveryNodeData.display,
      media: discoveryNodeData.media,
      commission: discoveryNodeData.commission,
      slots: [] // To be implemented
    })
  }

  get unitsSold() {
    // Lazy caching.
    if (this._unitsSold !== undefined) {
      return this._unitsSold
    }
    this._unitsSold = Object.keys(this.offers).reduce((acc, offerId) => {
      if (this.offers[offerId].status === 'created') {
        return acc + 1
      }
      // TODO: we need to subtract 1 for every offer that is canceled
      return acc
    }, 0)
    return this._unitsSold
  }

  get unitsRemaining() {
    // Should never be negative.
    return Math.max(this.unitsTotal - this.unitsSold, 0)
  }

  get active() {
    return this.status === 'active'
  }

}
