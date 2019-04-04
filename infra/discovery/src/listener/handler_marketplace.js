const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')
const { GrowthEvent } = require('@origin/growth/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth/src/enums')
const listingQuery = require('./queries/Listing')
const offerQuery = require('./queries/Offer')

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

function getOriginListingId(networkId, event) {
  return `${networkId}-000-${event.returnValues.listingID}-${event.blockNumber}`
}

function getOriginOfferId(networkId, event) {
  return `${networkId}-000-${event.returnValues.listingID}-${event.returnValues.offerID}`
}

/* Removes the block number that is appended to listing IDs when they are
 * returned from @origin/graphql.
 * @param {String} listingId - listing id as returned from @origin/graphql.
 *    format is {networkId}-000-{listingId}-{blockNumber}
 */
function removeListingIdBlockNumber(listingId) {
  return listingId
    .split('-')
    .splice(0, 3)
    .join('-')
}

class MarketplaceEventHandler {
  constructor(config, graphqlClient) {
    this.config = config
    this.graphqlClient = graphqlClient
  }

  /**
   * Gets details about a listing from @origin/graphql
   * @param {Object} block
   * @param {Object} event
   * @returns {Object} result of GraphQL query
   * @private
   */
  async _getListingDetails(block, event) {
    // Note that the listingId is passed with the blocknumber appended so we
    // can get the historical version of the listting
    const result = await this.graphqlClient.query({
      query: listingQuery,
      variables: {
        listingId: getOriginListingId(this.config.networkId, event)
      }
    })
    return result.data.marketplace
  }

  /**
   * Gets details about an offer by calling @origin/graphql
   * @param {Object} block
   * @param {Object} event
   * @returns {Object} result of GraphQL query
   * @private
   */
  async _getOfferDetails(block, event) {
    const result = await this.graphqlClient.query({
      query: offerQuery,
      variables: {
        offerId: getOriginOfferId(this.config.networkId, event),
        listingId: getOriginListingId(this.config.networkId, event)
      }
    })
    return result.data.marketplace
  }

  /**
   * Gets details about a listing or an offer by calling @origin/graphql
   * @param {Object} block
   * @param {Object} event
   * @returns {Promise<
   *    {listing: Listing, seller: User}|
   *    {listing: Listing, offer: Offer, seller: User, buyer: User}>}
   * @private
   */
  async _getDetails(block, event) {
    if (isListingEvent(event.event)) {
      return this._getListingDetails(block, event)
    } else if (isOfferEvent(event.event)) {
      return this._getOfferDetails(block, event)
    } else {
      throw new Error(`Unexpected event ${event.event}`)
    }
  }

  /**
   * Indexes a listing in the DB and in ElasticSearch.
   * @param {Object} event
   * @param {Object} details
   * @returns {Promise<void>}
   * @private
   */
  async _indexListing(block, event, { listing }) {
    const userAddress = event.returnValues.party
    const ipfsHash = event.returnValues.ipfsHash
    const blockDate = new Date(block.timestamp * 1000)

    // Data consistency: check listingId from the JSON stored in IPFS
    // matches with listingID emitted in the event.
    // TODO: use method utils/id.js:parseListingId
    const contractListingId = listing.id.split('-')[2]
    if (contractListingId !== event.returnValues.listingID) {
      throw new Error(
        `ListingId mismatch: ${contractListingId} !== ${
          event.returnValues.listingID
        }`
      )
    }

    logger.info(`Indexing listing in DB: \
      id=${listing.id} blockNumber=${event.blockNumber} logIndex=${
      event.logIndex
    }`)

    const listingData = {
      id: removeListingIdBlockNumber(listing.id),
      blockNumber: event.blockNumber,
      logIndex: event.logIndex,
      status: listing.status,
      sellerAddress: listing.seller.id.toLowerCase(),
      data: listing
    }

    if (event.event === 'ListingCreated') {
      listingData.createdAt = blockDate
    } else {
      listingData.updatedAt = blockDate
    }
    await db.Listing.upsert(listingData)

    if (this.config.elasticsearch) {
      logger.info(`Indexing listing in Elastic:  id=${listing.id}`)
      search.Listing.index(
        removeListingIdBlockNumber(listing.id),
        userAddress,
        ipfsHash,
        listing
      )
    }
  }

  /**
   * Indexes an offer in the DB and in ElasticSearch.
   * @param {Object} block
   * @param {Object} event
   * @param {Object} details
   * @returns {Promise<void>}
   * @private
   */
  async _indexOffer(block, event, details) {
    const listing = details.listing
    const offer = details.offer
    const blockDate = new Date(block.timestamp * 1000)

    logger.info(`Indexing offer in DB: id=${offer.id}`)
    const offerData = {
      id: offer.id,
      listingId: removeListingIdBlockNumber(listing.id),
      status: offer.status,
      sellerAddress: listing.seller.id.toLowerCase(),
      buyerAddress: offer.buyer.id.toLowerCase(),
      data: offer
    }
    if (event.event === 'OfferCreated') {
      offerData.createdAt = blockDate
    } else {
      offerData.updatedAt = blockDate
    }
    await db.Offer.upsert(offerData)
  }

  /**
   * Records ListingCreated, ListingPurchased and ListingSold events
   * in the growth DB.
   * @param log
   * @param details
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthEvent(block, event, details) {
    const blockInfo = {
      blockNumber: event.blockNumber,
      logIndex: event.logIndex
    }
    const blockDate = new Date(block.timestamp * 1000)

    switch (event.event) {
      case 'ListingCreated':
        await GrowthEvent.insert(
          logger,
          details.listing.seller.id.toLowerCase(),
          GrowthEventTypes.ListingCreated,
          removeListingIdBlockNumber(details.listing.id),
          { blockInfo },
          blockDate
        )
        break
      case 'OfferFinalized':
        // Insert a ListingPurchased event on the buyer side and
        // a ListingSold event on the seller side.
        await GrowthEvent.insert(
          logger,
          details.offer.buyer.id.toLowerCase(),
          GrowthEventTypes.ListingPurchased,
          details.offer.id,
          { blockInfo },
          blockDate
        )
        await GrowthEvent.insert(
          logger,
          details.listing.seller.id.toLowerCase(),
          GrowthEventTypes.ListingSold,
          details.offer.id,
          { blockInfo },
          blockDate
        )
        break
    }
  }

  /**
   * Main entry point for the MarketplaceHandler.
   * @param block
   * @param event
   * @returns {Promise<
   *    {listing: Listing, seller: User}|
   *    {listing: Listing, offer: Offer, seller: User, buyer: User}>}
   */
  async process(block, event) {
    if (!this.config.marketplace) {
      return null
    }

    const details = await this._getDetails(block, event)

    // On both listing and offer event, index the listing.
    // Notes:
    //  - Reason for also re-indexing on offer event is that the listing data includes
    // list of all events relevant to the listing.
    //  - We index both in DB and ES. DB is the ground truth for data and
    // ES is used for full-text search use cases.
    await this._indexListing(block, event, details)

    // On offer event, index the offer in the DB.
    if (isOfferEvent(event.event)) {
      await this._indexOffer(block, event, details)
    }

    if (this.config.growth) {
      await this._recordGrowthEvent(block, event, details)
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

module.exports = MarketplaceEventHandler
