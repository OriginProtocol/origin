const esmImport = require('esm')(module)
const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-event/src/enums')
const listingQuery = require('./queries/Listing')
const offerQuery = require('./queries/Offer')
const { getOriginListingId, getOriginOfferId } = esmImport(
  '@origin/graphql/src/utils/getId'
)

const { redisClient } = require('../lib/redis')

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
        offerId: getOriginOfferId(this.config.networkId, event)
      }
    })
    return {
      offer: result.data.marketplace.offer,
      listing: result.data.marketplace.offer.listing
    }
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
        `ListingId mismatch: ${contractListingId} !== ${event.returnValues.listingID}`
      )
    }

    logger.info(`Indexing listing in DB: \
      id=${listing.id} blockNumber=${event.blockNumber} logIndex=${event.logIndex}`)

    // Pull latest tags for listing from DB
    const latestTags = await db.DiscoveryTagAction.findOne({
      where: { ListingId: removeListingIdBlockNumber(listing.id) },
      order: [['id', 'DESC']]
    })
    if (latestTags && latestTags.data && latestTags.data.tags) {
      listing.scoreTags = latestTags.data.tags
    } else {
      // Important to keep people from setting their own scoreTags from IPFS
      listing.scoreTags = []
    }

    // Persist listing
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
      await search.Listing.index(
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
      status: offer.statusStr,
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
   * @param {Object} block
   * @param {Object} event
   * @param {Object} details
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
          1,
          details.listing.seller.id.toLowerCase(),
          GrowthEventTypes.ListingCreated,
          removeListingIdBlockNumber(details.listing.id),
          { blockInfo },
          blockDate
        )
        break
      case 'OfferFinalized':
        // For each unit purchased, insert a ListingPurchased event on
        // the buyer side and a ListingSold event on the seller side.
        const numPurchased = details.offer.quantity || 1

        // We use the offer creation as date of the event so that
        // buyer/seller get rewarded using rules from the campaign that
        // was running at time of offer rather than finalization.
        const offer = await db.Offer.findOne({
          where: { id: details.offer.id }
        })
        if (!offer) {
          throw new Error(`Failed loading offer id ${details.offer.id}`)
        }

        await GrowthEvent.insert(
          logger,
          numPurchased,
          details.offer.buyer.id.toLowerCase(),
          GrowthEventTypes.ListingPurchased,
          details.offer.id,
          { blockInfo },
          offer.createdAt
        )
        await GrowthEvent.insert(
          logger,
          numPurchased,
          details.listing.seller.id.toLowerCase(),
          GrowthEventTypes.ListingSold,
          details.offer.id,
          { blockInfo },
          offer.createdAt
        )
        break
    }
  }

  /**
   * Store Listing and Offer events for messaging
   * @param {Object} block
   * @param {Object} event
   * @param {Object} details
   * @returns {Promise<void>}
   * @private
   */
  async _storeEventForMessaging(block, event, details) {
    const { blockNumber, logIndex } = event
    const blockDate = new Date(block.timestamp * 1000)

    const buyer = details.offer.buyer.id
    const seller = details.listing.seller.id
    const sender = event.returnValues.party

    switch (event.event) {
      case 'OfferCreated':
      case 'OfferWithdrawn':
      case 'OfferAccepted':
      case 'OfferDisputed':
      case 'OfferRuling':
      case 'OfferFinalized':
      case 'OfferData':
        break

      default:
        // Ignore any other event
        return
    }

    // Publish to redis channel
    await redisClient.publish('MESSAGING:MARKETPLACE_EVENT', JSON.stringify({
      eventData: {
        blockNumber,
        blockDate,
        logIndex,
        eventType: event.event,
        seller,
        buyer,
        listingID: details.listing.id,
        offerID: details.offer.id
      },
      sender
    }))
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

    if (!details) {
      throw new Error('Unable to find listing or offer details')
    }

    // On both listing and offer event, index the listing.
    // Notes:
    //  - Reason for also re-indexing on offer event is that the listing data includes
    // list of all events relevant to the listing.
    //  - We index both in DB and ES. DB is the ground truth for data and
    // ES is used for full-text search use cases.
    await this._indexListing(block, event, details)

    const isOffer = isOfferEvent(event.event)

    // On offer event, index the offer in the DB.
    if (isOffer) {
      await this._indexOffer(block, event, details)
    }

    if (this.config.growth) {
      await this._recordGrowthEvent(block, event, details)
    }

    if (isOffer) {
      await this._storeEventForMessaging(block, event, details)
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
