const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')
const base58 = require('bs58')
const web3 = require('web3')
const { GrowthEvent } = require('origin-growth/src/resources/event')
const { GrowthEventTypes } = require('origin-growth/src/enums')
const { checkEventsFreshness } = require('./utils')

const LISTING_EVENTS = [
  'ListingCreated',
  'ListingUpdated',
  'ListingWithdrawn',
  'ListingData',
  'ListingArbitrated'
]

const OFFER_EVENTS = [
  'OfferCreated',
  'OfferWithdrawn',
  'OfferAccepted',
  'OfferDisputed',
  'OfferRuling',
  'OfferFinalized',
  'OfferData'
]

function isListingEvent(eventName) {
  return LISTING_EVENTS.includes(eventName)
}

function isOfferEvent(eventName) {
  return OFFER_EVENTS.includes(eventName)
}

function generateListingId(log) {
  return [log.networkId, log.contractVersionKey, log.decoded.listingID].join(
    '-'
  )
}

function generateOfferId(log) {
  return [
    log.networkId,
    log.contractVersionKey,
    log.decoded.listingID,
    log.decoded.offerID
  ].join('-')
}

const generateListingIdFromUnique = ({ network, version, uniqueId }) => {
  return [network, version, uniqueId].join('-')
}

const toNoGasListingID = listingID => {
  return base58.encode(web3.utils.toBN(listingID).toBuffer())
}

const generateNoGasListingId = log => {
  return [
    log.networkId,
    log.contractVersionKey,
    toNoGasListingID(log.decoded.listingID)
  ].join('-')
}

function generateNoGasOfferId(log) {
  return [
    log.networkId,
    log.contractVersionKey,
    toNoGasListingID(log.decoded.listingID),
    log.decoded.offerID
  ].join('-')
}

class MarketplaceEventHandler {
  constructor(config, origin) {
    this.config = config
    this.origin = origin
  }

  /**
   * Gets details about a listing by calling Origin-js.
   * @param {Object} log
   * @param {Object} origin - Instance of origin-js.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<{listing: Listing, seller: User}>}
   * @private
   */
  async _getListingDetails(log, origin, blockInfo) {
    const listingId = generateListingId(log)

    // Note: Passing blockInfo as an arg to the getListing call ensures that we preserve
    // listings version history if the listener is re-indexing data.
    // Otherwise all the listing version rows in the DB would end up with the same data.
    const listing = await origin.marketplace.getListing(listingId, {
      blockInfo: blockInfo,
      loadOffers: true
    })
    checkEventsFreshness(listing.events, blockInfo)

    let seller
    try {
      seller = await origin.users.get(listing.seller)
    } catch (e) {
      logger.error('Failed to fetch seller', e)
      // If fetching the seller fails, we still want to index the listing
    }
    return {
      listing: listing,
      seller: seller
    }
  }

  /**
   * Gets details about an offer by calling Origin-js.
   * @param {Object} log
   * @param {Object} origin - Instance of origin-js.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<{listing: Listing, offer: Offer, seller: User, buyer: User}>}
   * @private
   */
  async _getOfferDetails(log, origin, blockInfo) {
    const listingId = generateListingId(log)
    const offerId = generateOfferId(log)

    // Notes:
    //  - Passing blockInfo as an arg to the getListing call ensures that we preserve
    // listings version history if the listener is re-indexing data.
    // Otherwise all the listing versions in the DB would end up with the same data.
    //  - BlockInfo is not needed for the call to getOffer since offer data stored in the DB
    // is not versioned.
    const listing = await origin.marketplace.getListing(listingId, {
      blockInfo: blockInfo,
      loadOffers: true
    })
    checkEventsFreshness(listing.events, blockInfo)

    const offer = await origin.marketplace.getOffer(offerId)
    checkEventsFreshness(offer.events, blockInfo)

    let seller
    let buyer
    try {
      seller = await origin.users.get(listing.seller)
    } catch (e) {
      // If fetching the seller fails, we still want to index the listing/offer
      logger.error('Failed to fetch seller', e)
    }
    try {
      buyer = await origin.users.get(offer.buyer)
    } catch (e) {
      // If fetching the buyer fails, we still want to index the listing/offer
      logger.error('Failed to fetch buyer', e)
    }
    return {
      listing: listing,
      offer: offer,
      seller: seller,
      buyer: buyer
    }
  }

  /**
   * Gets details about a listing or an offer by calling Origin-js.
   * @param {Object} log
   * @param {Object} origin - Instance of origin-js.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<
   *    {listing: Listing, seller: User}|
   *    {listing: Listing, offer: Offer, seller: User, buyer: User}>}
   * @private
   */
  async _getDetails(log, origin, blockInfo) {
    if (isListingEvent(log.eventName)) {
      return this._getListingDetails(log, origin, blockInfo)
    }
    if (isOfferEvent(log.eventName)) {
      return this._getOfferDetails(log, origin, blockInfo)
    }
    throw new Error(`Unexpected event ${log.eventName}`)
  }

  /**
   * Indexes a listing in the DB and in ElasticSearch.
   * @param {Object} log
   * @param {Object} details
   * @returns {Promise<void>}
   * @private
   */
  async _indexListing(log, details) {
    const userAddress = log.decoded.party
    const ipfsHash = log.decoded.ipfsHash

    const listing = details.listing
    const listingId = listing.id

    // Data consistency: check  listingId from the JSON stored in IPFS
    // matches with listingID emitted in the event.
    // TODO: use method utils/id.js:parseListingId
    // DVF: this should really be handled in origin js - origin.js should throw
    // an error if this happens.
    const contractListingId = listingId.split('-')[2]
    if (
      contractListingId !== log.decoded.listingID &&
      contractListingId != toNoGasListingID(log.decoded.listingID)
    ) {
      throw new Error(
        `ListingId mismatch: ${contractListingId} !== ${log.decoded.listingID}`
      )
    }

    logger.info(`Indexing listing in DB: \
      id=${listingId} blockNumber=${log.blockNumber} logIndex=${log.logIndex}`)
    console.log(listing)
    const listingData = {
      id: listingId,
      blockNumber: log.blockNumber,
      logIndex: log.logIndex,
      status: listing.status,
      sellerAddress: listing.seller.toLowerCase(),
      data: listing
    }
    if (log.eventName === 'ListingCreated') {
      listingData.createdAt = log.date
    } else {
      listingData.updatedAt = log.date
    }
    await db.Listing.upsert(listingData)

    if (this.config.elasticsearch) {
      logger.info(`Indexing listing in Elastic: id=${listingId}`)
      search.Listing.index(listingId, userAddress, ipfsHash, listing)
    }
  }

  /**
   * Indexes an offer in the DB and in ElasticSearch.
   * @param {Object} log
   * @param {Object} details
   * @returns {Promise<void>}
   * @private
   */
  async _indexOffer(log, details) {
    const listing = details.listing
    const offer = details.offer
    logger.info(`Indexing offer in DB: id=${offer.id}`)
    const offerData = {
      id: offer.id,
      listingId: listing.id,
      status: offer.status,
      sellerAddress: listing.seller.toLowerCase(),
      buyerAddress: offer.buyer.toLowerCase(),
      data: offer
    }
    if (log.eventName === 'OfferCreated') {
      offerData.createdAt = log.date
    } else {
      offerData.updatedAt = log.date
    }
    await db.Offer.upsert(offerData)
  }

  /**
   * Records ListingCreated, ListingPurchased and ListingSold events
   * in the growth DB.
   * @param log
   * @param details
   * @param blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthEvent(log, details, blockInfo) {
    switch (log.eventName) {
      case 'ListingCreated':
        await GrowthEvent.insert(
          logger,
          details.listing.seller.toLowerCase(),
          GrowthEventTypes.ListingCreated,
          details.listing.id,
          { blockInfo }
        )
        break
      case 'OfferFinalized':
        // Insert a ListingPurchased event on the buyer side and
        // a ListingSold event on the seller side.
        await GrowthEvent.insert(
          logger,
          details.offer.buyer.toLowerCase(),
          GrowthEventTypes.ListingPurchased,
          details.offer.id,
          { blockInfo }
        )
        await GrowthEvent.insert(
          logger,
          details.listing.seller.toLowerCase(),
          GrowthEventTypes.ListingSold,
          details.offer.id,
          { blockInfo }
        )
        break
    }
  }

  /**
   * Main entry point for the MarketplaceHandler.
   * @param log
   * @returns {Promise<
   *    {listing: Listing, seller: User}|
   *    {listing: Listing, offer: Offer, seller: User, buyer: User}>}
   */
  async process(log) {
    if (!this.config.marketplace) {
      return null
    }

    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }
    const details = await this._getDetails(log, this.origin, blockInfo)

    // On both listing and offer event, index the listing.
    // Notes:
    //  - Reason for also re-indexing on offer event is that the listing data includes
    // list of all events relevant to the listing.
    //  - We index both in DB and ES. DB is the ground truth for data and
    // ES is used for full-text search use cases.
    await this._indexListing(log, details)

    // On offer event, index the offer in the DB.
    if (isOfferEvent(log.eventName)) {
      await this._indexOffer(log, details)
    }

    if (this.config.growth) {
      await this._recordGrowthEvent(log, details, blockInfo)
    }

    return details
  }

  webhookEnabled() {
    return this.config.marketplace
  }

  discordWebhookEnabled() {
    return this.config.marketplace
  }

  emailWebhookEnabled() {
    return false
  }

  gcloudPubsubEnabled() {
    return this.config.marketplace
  }
}

class NoGasMarketplaceEventHandler extends MarketplaceEventHandler {
  /**
   * Gets details about an offer by calling Origin-js.
   * @param {Object} log
   * @param {Object} origin - Instance of origin-js.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<{listing: Listing, offer: Offer, seller: User, buyer: User}>}
   * @private
   */
  async _getOfferDetails(log, origin, blockInfo) {
    const listingId = generateNoGasListingId(log)
    const offerId = generateNoGasOfferId(log)

    const offer = await origin.marketplace.getOffer(offerId)

    checkEventsFreshness(offer.events, blockInfo)

    // TODO: need to load from db to verify that the listingIpfs haven't already been set!!!
    //const status = web3.utils.toBN(offer.seller) != 0 ? 'pending': 'active'
    const network = await origin.contractService.web3.eth.net.getId()

    const listing = await origin.marketplace._listingFromData(listingId, {
      status: 'active',
      seller: offer.seller,
      ipfsHash: offer.listingIpfsHash
    })

    if (
      generateListingIdFromUnique({
        version: 'A',
        network,
        uniqueId: listing.uniqueId
      }) != listingId
    ) {
      throw new Error(
        `ListingIpfs and Id mismatch: ${listingId} !== ${
          listing.creator.listing.createDate
        }`
      )
    }

    if (listing.creator != offer.buyer) {
      if (listing.creator != offer.seller) {
        throw new Error(
          `listing creator ${listing.creator} does not match buyer(${
            offer.buyer
          }) or seller(${offer.seller})`
        )
      }

      if (
        !(await origin.marketplace.verifyListingSignature(
          listing,
          listing.seller
        ))
      ) {
        throw new Error(
          `listing signature does not match seller ${listing.seller}.`
        )
      }
    }

    let seller
    let buyer
    if (web3.utils.toBN(offer.seller) != 0) {
      try {
        seller = await origin.users.get(offer.seller)
      } catch (e) {
        // If fetching the seller fails, we still want to index the listing/offer
        console.log('Failed to fetch seller', e)
      }
    }
    try {
      buyer = await origin.users.get(offer.buyer)
    } catch (e) {
      // If fetching the buyer fails, we still want to index the listing/offer
      console.log('Failed to fetch buyer', e)
    }
    return {
      listing,
      offer: offer,
      seller: seller,
      buyer: buyer
    }
  }
}

module.exports = { MarketplaceEventHandler, NoGasMarketplaceEventHandler }
