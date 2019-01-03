//
// Listing is the main object exposed by Origin Protocol to access listing data.
//
export class Listing {
  /**
   * Listing object model.
   *
   * Notice: when adding a field, be aware that the data in the discovery back-end
   * is not automatically re-indexed. Therefore old listings will be returned by
   * the back-end with the new field's value set to 'undefined'.
   *
   * @param {Object} args - single object arguments used to construct a Listing
   *  - {string} id
   *  - {string} title
   *  - {string} description
   *  - {string} category
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
   *  - {Object} commission - Total commission of a listing. Consists of 'amount' and 'currency' properties
   *  - {Array} slots - to be implemented
   *  - {Integer} slotLength - defines the length of a time slot in a fractional listing
   *  - {String} slotLengthUnit - defines the unit of measurement for a fractional usage time slot
   *  - {string} schemaId
   *  - {string} dappSchemaId - Optional. JSON schema used by the DApp to create the listing.
   *  - {string} deposit
   *  - {string} depositManager - address of depositManager
   *  - {Object} commissionPerUnit - Commission per unit in multi unit listings. Consists of 'amount' and 'currency' properties
   */
  constructor({ id, title, display, description, category, subCategory, status, type, media,
    unitsTotal, offers, events, ipfs, ipfsHash, language, price, seller, commission, slots,
    slotLength, slotLengthUnit, schemaId, dappSchemaId, deposit, depositManager, commissionPerUnit }) {

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
    this.slotLength = slotLength
    this.slotLengthUnit = slotLengthUnit
    this.schemaId = schemaId
    this.dappSchemaId = dappSchemaId
    this.deposit = deposit
    this.depositManager = depositManager
    this.commissionPerUnit = commissionPerUnit
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
      slots: ipfsListing.slots,
      slotLength: ipfsListing.slotLength,
      slotLengthUnit: ipfsListing.slotLengthUnit,
      schemaId: ipfsListing.schemaId,
      dappSchemaId: ipfsListing.dappSchemaId,
      deposit: chainListing.deposit,
      depositManager: chainListing.depositManager,
      commissionPerUnit: ipfsListing.commissionPerUnit,
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
      slots: discoveryNodeData.slots,
      slotLength: discoveryNodeData.slotLength,
      slotLengthUnit: discoveryNodeData.slotLengthUnit,
      schemaId: discoveryNodeData.schemaId,
      dappSchemaId: discoveryNodeData.dappSchemaId,
      deposit: discoveryNodeData.deposit,
      depositManager: discoveryNodeData.depositManager,
      commissionPerUnit: discoveryNodeData.commissionPerUnit
    })
  }

  get active() {
    return this.status === 'active'
  }

  get unitsPending() {
    if (!Array.isArray(this.offers))
      return undefined

    return this.offers
      // only keep offers that are in a pending state
      .filter(offer => ['created', 'accepted', 'disputed'].includes(offer.status))
      .reduce((agg, offer) => agg + offer.unitsPurchased, 0)
  }

  get unitsSold() {
    if (!Array.isArray(this.offers))
      return undefined

    return this.offers
      // only keep offers that are in a sold state
      .filter(offer => ['finalized', 'sellerReviewed', 'ruling'].includes(offer.status))
      .reduce((agg, offer) => agg + offer.unitsPurchased, 0)
  }

  get unitsRemaining() {
    if (!Array.isArray(this.offers))
      return undefined

    return Math.max(0, this.unitsTotal - this.unitsPending - this.unitsSold)
  }

  get commissionRemaining() {
    if (!Array.isArray(this.offers))
      return undefined

    // if not multi unit
    if (!(this.type === 'unit' && this.unitsTotal > 0))
      return undefined

    const commissionRemaining = this.offers
      .reduce((agg, offer) => agg + offer.commission.amount, 0)

    return Math.max(0, this.commission.amount - commissionRemaining)
  }
}
