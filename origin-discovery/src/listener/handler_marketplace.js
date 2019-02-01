
const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')
const { withRetrys } = require('./utils')

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

function generateListingId(log) {
  return [
    log.networkId,
    log.contractVersionKey,
    log.decoded.listingID
  ].join('-')
}

function generateOfferId(log) {
  return [
    log.networkId,
    log.contractVersionKey,
    log.decoded.listingID,
    log.decoded.offerID
  ].join('-')
}

/**
 * Ensures data fetched from the blockchain meets the freshness criteria
 * specified in blockInfo. This is to catch the case where data is fetched from
 * an out of sync node that returns stale data.
 * @param {List(Event)} events
 * @param {blockNumber: number, logIndex: number} blockInfo
 * @throws {Error} If freshness check fails
 */
function checkEventsFreshness(events, blockInfo) {
  // Find at least 1 event that is as fresh as blockInfo.
  const fresh = events.some(event => {
    return (event.blockNumber > blockInfo.blockNumber) ||
      (event.blockNumber === blockInfo.blockNumber && event.logIndex >= blockInfo.logIndex)
  })
  if (!fresh) {
    throw new Error('Freshness check failed')
  }
}


class MarketplaceEventHandler {
  async _getListingDetails(log, origin) {
    const listingId = generateListingId(log)
    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }
    // Note: Passing blockInfo as an arg to the getListing call ensures that we preserve
    // listings version history if the listener is re-indexing data.
    // Otherwise all the listing version rows in the DB would end up with the same data.
    const listing = await origin.marketplace.getListing(listingId, { blockInfo: blockInfo, loadOffers: true })
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

  async _getOfferDetails(log, origin) {
    const listingId = generateListingId(log)
    const offerId = generateOfferId(log)
    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }
    // Notes:
    //  - Passing blockInfo as an arg to the getListing call ensures that we preserve
    // listings version history if the listener is re-indexing data.
    // Otherwise all the listing versions in the DB would end up with the same data.
    //  - BlockInfo is not needed for the call to getOffer since offer data stored in the DB
    // is not versioned.
    const listing = await origin.marketplace.getListing(listingId, { blockInfo: blockInfo, loadOffers: true })
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

  async _getDetails(log, origin) {
    if (LISTING_EVENTS.includes(log.eventName)) {
      return this._getListingDetails(log, origin)
    }
    if (OFFER_EVENTS.include(log.eventName)) {
      return this._getOfferDetails(log, origin)
    }
    throw new Error(`Unexpected event ${log.eventName}`)
  }

  async process(log, context) {
    const details = await this._getDetails(log, context.origin)

    const userAddress = log.decoded.party
    const ipfsHash = log.decoded.ipfsHash

    // TODO: remove binary data from pictures in a proper way.
    const listing = details.listing
    delete listing.ipfs.data.pictures
    const listingId = listing.id

    // Data consistency: check  listingId from the JSON stored in IPFS
    // matches with listingID emitted in the event.
    // TODO: use method utils/id.js:parseListingId
    // DVF: this should really be handled in origin js - origin.js should throw
    // an error if this happens.
    const ipfsListingId = listingId.split('-')[2]
    if (ipfsListingId !== log.decoded.listingID) {
      throw new Error(`ListingId mismatch: ${ipfsListingId} !== ${log.decoded.listingID}`)
    }

    // On listing or offer event, index the listing.
    // Notes:
    //  - Reason for also re-indexing on offer event is that the listing data includes
    // list of all events relevant to the listing.
    //  - We index both in DB and ES. DB is the ground truth for data and
    // ES is used for full-text search use cases.
    if (context.config.db) {
      logger.info(`Indexing listing in DB:
      id=${listingId} blockNumber=${log.blockNumber} logIndex=${log.logIndex}`)
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
      await withRetrys(async () => {
        return db.Listing.upsert(listingData)
      })

    }

    if (context.config.elasticsearch) {
      logger.info(`Indexing listing in Elastic: id=${listingId}`)
      await withRetrys(async () => {
        return search.Listing.index(listingId, userAddress, ipfsHash, listing)
      })
    }

    // On offer event, index the offer in the DB.
    if (OFFER_EVENTS.includes(log.eventName)) {
      if (context.config.db) {
        const offer = details.offer
        logger.info(`Indexing offer in DB: id=${offer.id}`)
        const offerData = {
          id: offer.id,
          listingId: listingId,
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
        await withRetrys(async () => {
          return db.Offer.upsert(offerData)
        })
      }
    }

    return details
  }

  webhookEnabled() {
    return false
  }

  discordWebhookEnabled() {
    return false
  }
}

module.exports = MarketplaceEventHandler