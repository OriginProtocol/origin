const base58 = require('bs58')
const web3 = require('web3')

//
// Listing is the main object exposed by Origin Protocol to access listing data.
//
class Listing {
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
   *  - {Array} availability - to be implemented
   *  - {Integer} slotLength - defines the length of a time slot in a fractional listing
   *  - {String} slotLengthUnit - defines the unit of measurement for a fractional usage time slot
   *  - {string} schemaId
   *  - {string} dappSchemaId - Optional. JSON schema used by the DApp to create the listing.
   *  - {string} deposit
   *  - {string} depositManager - address of depositManager
   *  - {string} marketplacePublisher - address of the publisher of the marketplace that the listing originated from
   *  - {Object} commissionPerUnit - Commission per unit in multi unit listings. Consists of 'amount' and 'currency' properties
   */
  constructor({ id, title, display, description, category, subCategory, status, type, media,
    unitsTotal, offers, events, ipfs, ipfsHash, language, price, seller, commission, availability,
    slotLength, slotLengthUnit, schemaId, dappSchemaId, deposit, depositManager, commissionPerUnit,
    marketplacePublisher, createDate, updateVersion, creator }) {

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
    this.availability = availability
    this.slotLength = slotLength
    this.slotLengthUnit = slotLengthUnit
    this.schemaId = schemaId
    this.dappSchemaId = dappSchemaId
    this.deposit = deposit
    this.depositManager = depositManager
    this.commissionPerUnit = commissionPerUnit
    this.marketplacePublisher = marketplacePublisher
    this.createDate = createDate
    this.updateVersion = updateVersion
    this.creator = creator
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
      availability: ipfsListing.availability,
      slotLength: ipfsListing.slotLength,
      slotLengthUnit: ipfsListing.slotLengthUnit,
      schemaId: ipfsListing.schemaId,
      dappSchemaId: ipfsListing.dappSchemaId,
      deposit: chainListing.deposit,
      depositManager: chainListing.depositManager,
      commissionPerUnit: ipfsListing.commissionPerUnit,
      createDate: ipfsListing.createDate,
      marketplacePublisher: ipfsListing.marketplacePublisher,
      updateVersion: ipfsListing.updateVersion,
      creator: ipfsListing.creator
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
      availability: discoveryNodeData.availability,
      slotLength: discoveryNodeData.slotLength,
      slotLengthUnit: discoveryNodeData.slotLengthUnit,
      schemaId: discoveryNodeData.schemaId,
      dappSchemaId: discoveryNodeData.dappSchemaId,
      deposit: discoveryNodeData.deposit,
      depositManager: discoveryNodeData.depositManager,
      commissionPerUnit: discoveryNodeData.commissionPerUnit,
      marketplacePublisher: discoveryNodeData.marketplacePublisher,
      creator: discoveryNodeData.creator,
      updateVersion: discoveryNodeData.updateVersion,
      createDate: discoveryNodeData.createDate
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

    const unitsRemaining = Math.max(0, this.unitsTotal - this.unitsPending - this.unitsSold)

    // this must not be NaN because it throws an error in react-jsonschema-form
    return isNaN(unitsRemaining) ? 1 : unitsRemaining
  }

  get commissionRemaining() {
    if (!Array.isArray(this.offers))
      return undefined

    // if not multi unit
    if (!(this.type === 'unit' && this.unitsTotal > 1))
      return undefined

    const commissionUsedInOffers = this.offers
      .reduce((agg, offer) => agg + parseInt(offer.commission.amount), 0)

    return Math.max(0, this.commission.amount - commissionUsedInOffers)
  }

  // Commission used to prioritize this listing over the others in search functionality
  get boostCommission() {
    // if is multi unit listing
    if (this.type === 'unit' && this.unitsTotal > 1) {
      return {
        currency: this.commissionPerUnit.currency,
        amount: Math.min(this.commissionRemaining, this.commissionPerUnit.amount) 
      }
    } else {
      return this.commission
    }
  }

  get uniqueId() {
    const hash = web3.utils.soliditySha3({ t: 'address', v: this.creator },
      { t: 'bytes32', v: web3.utils.fromAscii(this.createDate) })
    return base58.encode(Buffer.from(hash.slice(2), 'hex'))
  }

  get isEmptySeller() {
    return this.seller == '0x0000000000000000000000000000000000000000'
  }
}

module.exports = { Listing }
