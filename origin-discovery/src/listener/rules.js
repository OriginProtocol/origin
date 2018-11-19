const db = require('../models')
const search = require('../lib/search.js')
const { withRetrys } = require('./utils')

const { postToDiscordWebhook, postToWebhook } = require('./webhooks.js')

// Helper functions
const generateListingId = log => {
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

async function getListingDetails(log, origin) {
  const listingId = generateListingId(log)
  const listing = await origin.marketplace.getListing(listingId)
  let seller
  try {
    seller = await origin.users.get(listing.seller)
  } catch (e) {
    console.log('Failed to fetch seller', e)
    // If fetching the seller fails, we still want to index the listing
  }
  return {
    listing: listing,
    seller: seller
  }
}

async function getOfferDetails(log, origin) {
  const listing = await origin.marketplace.getListing(generateListingId(log))
  const offer = await origin.marketplace.getOffer(generateOfferId(log))
  let seller
  let buyer
  try {
    seller = await origin.users.get(listing.seller)
  } catch (e) {
    // If fetching the seller fails, we still want to index the listing/offer
    console.log('Failed to fetch seller', e)
  }
  try {
    buyer = await origin.users.get(offer.buyer)
  } catch (e) {
    // If fetching the buyer fails, we still want to index the listing/offer
    console.log('Failed to fetch buyer', e)
  }
  return {
    listing: listing,
    offer: offer,
    seller: seller,
    buyer: buyer
  }
}

// Rules for acting on events
// Adding a rule here makes the listener listen for the event.
const LISTEN_RULES = {
  V00_Marketplace: {
    ListingCreated: getListingDetails,
    ListingUpdated: getListingDetails,
    ListingWithdrawn: getListingDetails,
    ListingData: getListingDetails,
    ListingArbitrated: getListingDetails,
    OfferCreated: getOfferDetails,
    OfferWithdrawn: getOfferDetails,
    OfferAccepted: getOfferDetails,
    OfferDisputed: getOfferDetails,
    OfferRuling: getOfferDetails,
    OfferFinalized: getOfferDetails,
    OfferData: getOfferDetails
  }
}

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

/**
 *  Takes an event/log and a matching rule
 *  then annotates the event/log, runs the rule, and outputs everything.
 */
async function handleLog (log, rule, contractVersion, context) {
  log.decoded = context.web3.eth.abi.decodeLog(
    rule.eventAbi.inputs,
    log.data,
    log.topics.slice(1)
  )
  log.contractName = contractVersion.contractName
  log.eventName = rule.eventName
  log.contractVersionKey = contractVersion.versionKey
  log.networkId = context.networkId

  // Fetch block to retrieve timestamp.
  let block
  await withRetrys(async () => {
    block = await context.web3.eth.getBlock(log.blockNumber)
  })
  log.timestamp = block.timestamp
  log.date = new Date(log.timestamp * 1000)

  const logDetails = `blockNumber=${log.blockNumber} \
    transactionIndex=${log.transactionIndex} \
    eventName=${log.eventName} \
    contractName=${log.contractName}`
  console.log(`Processing log: ${logDetails}`)

  if (context.config.db) {
    await withRetrys(async () => {
      db.Event.upsert({
        blockNumber: log.blockNumber,
        logIndex: log.logIndex,
        contractAddress: log.address,
        transactionHash: log.transactionHash,
        topic0: log.topics[0],
        topic1: log.topics[1],
        topic2: log.topics[2],
        topic3: log.topics[3],
        data: log,
        createdAt: log.date
      })
    })
  }

  // Note: we run the rule with a retry since we've seen in production cases where we fail loading
  // from smart contracts the data pointed to by the event. This may occur due to load balancing
  // across ethereum nodes and if some nodes are lagging. For example the ethereum node we
  // end up connecting to for reading the data may lag compared to the node received the event from.
  let ruleResults
  try {
    await withRetrys(async () => {
      ruleResults = await rule.ruleFn(log, context.origin)
    }, false)
  } catch (e) {
    console.log(`Skipping indexing for ${logDetails} - ${e}`)
    return
  }

  const output = {
    log: log,
    related: ruleResults
  }

  const json = JSON.stringify(output, null, 2)
  if (context.config.verbose) {
    console.log(json)
    console.log('\n----\n')
  }

  const userAddress = log.decoded.party
  const ipfsHash = log.decoded.ipfsHash

  // TODO: remove binary data from pictures in a proper way.
  const listing = output.related.listing
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

  // TODO: This kind of verification logic should live in origin.js
  if (output.related.listing.ipfs.data.price === undefined) {
    console.log(`ERROR: listing ${listingId} has no price. Skipping indexing.`)
    return
  }

  // On listing or offer event, index the listing.
  // Notes:
  //  - Reason for also re-indexing on offer event is that the listing data includes
  // list of all events relevant to the listing.
  //  - We index both in DB and ES. DB is the ground truth for data and
  // ES is used for full-text search use cases.
  if (LISTING_EVENTS.includes(rule.eventName) || OFFER_EVENTS.includes(rule.eventName)) {
    if (context.config.db) {
      console.log(`Indexing listing in DB:
        id=${listingId} blockNumber=${log.blockNumber} logIndex=${log.logIndex}`)
      const listingData = {
        id: listingId,
        status: listing.status,
        sellerAddress: listing.seller.toLowerCase(),
        data: listing
      }
      if (rule.eventName === 'ListingCreated') {
        listingData.createdAt = log.date
      } else {
        listingData.updatedAt = log.date
      }
      await withRetrys(async () => {
        db.Listing.upsert(listingData)
      })
    }

    if (context.config.elasticsearch) {
      console.log(`Indexing listing in Elastic: id=${listingId}`)
      await withRetrys(async () => {
        search.Listing.index(listingId, userAddress, ipfsHash, listing)
      })
    }
  }

  // On offer event, index the offer in the DB.
  if (OFFER_EVENTS.includes(rule.eventName)) {
    if (context.config.db) {
      const offer = output.related.offer
      console.log(`Indexing offer in DB: id=${offer.id}`)
      const offerData = {
        id: offer.id,
        listingId: listingId,
        status: offer.status,
        sellerAddress: listing.seller.toLowerCase(),
        buyerAddress: offer.buyer.toLowerCase(),
        data: offer
      }
      if (rule.eventName === 'OfferCreated') {
        offerData.createdAt = log.date
      } else {
        offerData.updatedAt = log.date
      }
      await withRetrys(async () => {
        db.Offer.upsert(offerData)
      })
    }
  }

  // On listing or offer event, index the user.
  // FIXME:
  //  1. Move user data from ES to DB.
  //  2. Register listener with identity events and trigger user indexing based on those
  //     rather than on listing/offer events (which is incorrect since a user could have
  //     a profile and no listing/purchase.
  //  3. Be fault tolerant to some profile load failures. For instance we had a bug at
  //     launch that caused some corrupted claim data to be written in blockchain.
  //     We should still do best effort to gracefully handle those errors rather than
  //     skipping indexing for those accounts.
  if (context.config.elasticsearch) {
    if (output.related.seller !== undefined) {
      const seller = output.related.seller
      console.log(`Indexing seller in Elastic: addr=${seller.address}`)
      await withRetrys(async () => {
        search.User.index(seller)
      })
    }
    if (output.related.buyer !== undefined) {
      const buyer = output.related.buyer
      console.log(`Indexing buyer in Elastic: addr=${buyer.address}`)
      await withRetrys(async () => {
        search.User.index(output.related.buyer)
      })
    }
  }

  if (context.config.webhook) {
    console.log('\n-- WEBHOOK to ' + context.config.webhook + ' --\n')
    try {
      await withRetrys(async () => {
        postToWebhook(context.config.webhook, json)
      }, false)
    } catch (e) {
      console.log(`Skipping webhook for ${logDetails}`)
    }
  }

  if (context.config.discordWebhook) {
    console.log(
      '\n-- Discord WEBHOOK to ' + context.config.discordWebhook + ' --'
    )
    try {
      await withRetrys(async () => {
        postToDiscordWebhook(context.config.discordWebhook, output)
      }, false)
    } catch (e) {
      console.log(`Skipping discord webhook for ${logDetails}`)
    }
  }
}

module.exports = { handleLog, LISTEN_RULES }