require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const express = require('express')
const promBundle = require('express-prom-bundle')
const urllib = require('url')
const Origin = require('origin').default
const Web3 = require('web3')

const search = require('../lib/search.js')
const db = require('../models')

const { getLastBlock, setLastBlock, withRetrys } = require('./utils.js')
const { postToDiscordWebhook, postToWebhook } = require('./webhooks.js')

// Create an express server for Prometheus to scrape metrics
const app = express()
const bundle = promBundle({
  includeMethod: true,
  promClient: {
    collectDefaultMetrics: {
      timeout: 1000
    }
  }
})
app.use(bundle)

const blockGauge = new bundle.promClient.Gauge({
  name: 'event_listener_last_block',
  help: 'The last block processed by the event listener'
})

// Origin Listener
// ---------------

// Todo
// - Handle blockchain splits/winners
// - Include current-as-of block numbers in POSTs
// - Persist starting point in DB
// - Perhaps send related data as it was at the time of the event, not as of crawl time
// - Possible configurable log levels

let web3
let o

const MAX_BATCH_BLOCKS = 3000 // Adjust as needed as Origin gets more popular

// -----------------------------
// Section 1: Follow rules
// -----------------------------

// Helper functions
const generateListingId = log => {
  return [log.networkId, log.contractVersionKey, log.decoded.listingID].join(
    '-'
  )
}
const generateOfferId = log => {
  return [
    log.networkId,
    log.contractVersionKey,
    log.decoded.listingID,
    log.decoded.offerID
  ].join('-')
}
const getListingDetails = async log => {
  const listingId = generateListingId(log)
  const listing = await o.marketplace.getListing(listingId)
  let seller
  try {
    seller = await o.users.get(listing.seller)
  } catch (e) {
    console.log('Failed to fetch seller', e)
    // If fetching the seller fails, we still want to index the listing
  }
  return {
    listing: listing,
    seller: seller
  }
}

const getOfferDetails = async log => {
  const listing = await o.marketplace.getListing(generateListingId(log))
  const offer = await o.marketplace.getOffer(generateOfferId(log))
  let seller
  let buyer
  try {
    seller = await o.users.get(listing.seller)
  } catch (e) {
    // If fetching the seller fails, we still want to index the listing/offer
    console.log('Failed to fetch seller', e)
  }
  try {
    buyer = await o.users.get(offer.buyer)
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
// -------------------------------
// Section 2: The following engine
// -------------------------------

/**
 * setup Origin JS according to the config.
 */
function setupOriginJS (config) {
  const web3Provider = new Web3.providers.HttpProvider(config.web3Url)
  // global
  web3 = new Web3(web3Provider)

  const ipfsUrl = new urllib.URL(config.ipfsUrl)

  // Error out if any mandatory env var is not set.
  if (!config.arbitratorAccount) {
    throw new Error('ARBITRATOR_ACCOUNT not set')
  }
  if (!config.affiliateAccount) {
    throw new Error('AFFILIATE_ACCOUNT not set')
  }

  // Issue a warning for any recommended env var that is not set.
  if (!config.blockEpoch) {
    console.log(
      'WARNING: For performance reasons it is recommended to set BLOCK_EPOCH'
    )
  }

  // global
  o = new Origin({
    ipfsDomain: ipfsUrl.hostname,
    ipfsGatewayProtocol: ipfsUrl.protocol.replace(':', ''),
    ipfsGatewayPort: ipfsUrl.port,
    arbitrator: config.arbitratorAccount,
    affiliate: config.affiliateAccount,
    blockEpoch: config.blockEpoch,
    web3
  })
}

/**
 *  liveTracking
 * - checks for a new block every checkIntervalSeconds
 * - if new block appeared, look for all events after the last found event
 */
async function liveTracking (config) {
  setupOriginJS(config)
  const context = await new Context(config).init()

  let lastLogBlock = await getLastBlock(config)
  let lastCheckedBlock = 0
  const checkIntervalSeconds = 5
  let start

  const check = async () => {
    await withRetrys(async () => {
      start = new Date()
      const currentBlockNumber = await web3.eth.getBlockNumber()
      if (currentBlockNumber === lastCheckedBlock) {
        console.log('No new block.')
        return scheduleNextCheck()
      }
      console.log('New block: ' + currentBlockNumber)
      blockGauge.set(currentBlockNumber)
      const toBlock = Math.min(
        // Pick the smallest of either
        // the last log we processed, plus the max batch size
        lastLogBlock + MAX_BATCH_BLOCKS,
        // or the current block number, minus any trailing blocks we waiting on
        Math.max(currentBlockNumber - config.trailBlocks, 0)
      )
      const opts = { fromBlock: lastLogBlock + 1, toBlock: toBlock }
      await runBatch(opts, context)
      lastLogBlock = toBlock
      await setLastBlock(config, toBlock)
      lastCheckedBlock = currentBlockNumber
      return scheduleNextCheck()
    })
  }
  const scheduleNextCheck = async () => {
    const elapsed = new Date() - start
    const delay = Math.max(checkIntervalSeconds * 1000 - elapsed, 1)
    setTimeout(check, delay)
  }

  check()
}

/**
 * runBatch - gets and processes logs for a range of blocks
 */
async function runBatch (opts, context) {
  const fromBlock = opts.fromBlock
  const toBlock = opts.toBlock
  let lastLogBlock

  console.log(
    'Looking for logs from block ' + fromBlock + ' to ' + (toBlock || 'Latest')
  )

  const eventTopics = Object.keys(context.signatureToRules)
  const logs = await web3.eth.getPastLogs({
    fromBlock: web3.utils.toHex(fromBlock), // Hex required for infura
    toBlock: toBlock ? web3.utils.toHex(toBlock) : 'latest', // Hex required for infura
    topics: [eventTopics]
  })

  if (logs.length > 0) {
    console.log('' + logs.length + ' logs found')
  }

  for (const log of logs) {
    const contractVersion = context.addressToVersion[log.address]
    if (contractVersion === undefined) {
      continue // Skip - Not a trusted contract
    }
    const contractName = contractVersion.contractName
    const rule = context.signatureToRules[log.topics[0]][contractName]
    if (rule === undefined) {
      continue // Skip - No handler defined
    }
    lastLogBlock = log.blockNumber
    // Process it
    await handleLog(log, rule, contractVersion, context)
  }
  return lastLogBlock
}

/**
 *  Takes and event/log and a matching rule
 *  then annotates the event/log, runs the rule, and ouputs everything.
 */
async function handleLog (log, rule, contractVersion, context) {
  log.decoded = web3.eth.abi.decodeLog(
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
    block = await web3.eth.getBlock(log.blockNumber)
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
      await db.Event.upsert({
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
      ruleResults = await rule.ruleFn(log)
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

  if (context.config.elasticsearch) {
    console.log(`Indexing listing in Elastic: id=${listingId}`)
    await withRetrys(async () => {
      await search.Listing.index(listingId, userAddress, ipfsHash, listing)
    })
    if (output.related.offer !== undefined) {
      const offer = output.related.offer
      console.log(`Indexing offer in Elastic: id=${offer.id} `)
      await withRetrys(async () => {
        await search.Offer.index(offer, listing)
      })
    }
    if (output.related.seller !== undefined) {
      const seller = output.related.seller
      console.log(`Indexing seller in Elastic: addr=${seller.address}`)
      await withRetrys(async () => {
        await search.User.index(seller)
      })
    }
    if (output.related.buyer !== undefined) {
      const buyer = output.related.buyer
      console.log(`Indexing buyer in Elastic: addr=${buyer.address}`)
      await withRetrys(async () => {
        await search.User.index(output.related.buyer)
      })
    }
  }

  if (context.config.db) {
    if (LISTING_EVENTS.includes(rule.eventName)) {
      console.log(`Indexing listing in DB: id=${listingId}`)
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
        await db.Listing.upsert(listingData)
      })
    }

    if (OFFER_EVENTS.includes(rule.eventName)) {
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
        await db.Offer.upsert(offerData)
      })
    }
  }

  if (context.config.webhook) {
    console.log('\n-- WEBHOOK to ' + context.config.webhook + ' --\n')
    try {
      await withRetrys(async () => {
        await postToWebhook(context.config.webhook, json)
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

// -------------------------------------------------------------------
// Section 3: Getting the contract information we need to track events
// -------------------------------------------------------------------

class Context {
  constructor (config) {
    this.config = config
    this.signatureToRules = undefined
    this.addressToVersion = undefined
    this.networkId = undefined
  }

  async init () {
    this.signatureToRules = buildSignatureToRules()
    this.addressToVersion = await buildAddressToVersion()
    this.networkId = await web3.eth.net.getId()
    return this
  }
}

/**
 * Builds a lookup object that allows you to start from an ETH event signature,
 * and find out what contract and what event fired it. Each event also includes a
 * list of our javascript event handler functions we want to fire for that log.
 * @example
 * buildSignatureToRules()
 * // { '0xec3d306143145322b45d2788d826e3b7b9ad062f16e1ec59a5eaba214f96ee3c':
 * //     { V00_Marketplace:
 * //          { contractName: 'V00_Marketplace',
 * //            eventName: 'ListingCreated',
 * //            eventAbi: [Object],
 * //            ruleFn: [...] } },
 * //   '0x470503ad37642fff73a57bac35e69733b6b38281a893f39b50c285aad1f040e0':
 * //      { V00_Marketplace:
 * //          { contractName: 'V00_Marketplace',
 * //            eventName: 'ListingUpdated',
 * //            eventAbi: [Object],
 * //            ruleFn: [...] } }
 * //   }
 */
function buildSignatureToRules () {
  const signatureLookup = {}
  for (const contractName in LISTEN_RULES) {
    const eventRules = LISTEN_RULES[contractName]
    const contract = o.contractService.contracts[contractName]
    if (contract === undefined) {
      throw Error("Can't find contract " + contractName)
    }
    contract.abi.filter(x => x.type === 'event').forEach(eventAbi => {
      const ruleFn = eventRules[eventAbi.name]
      if (ruleFn === undefined) {
        return
      }
      const signature = web3.eth.abi.encodeEventSignature(eventAbi)
      if (signatureLookup[signature] === undefined) {
        signatureLookup[signature] = {}
      }
      signatureLookup[signature][contractName] = {
        contractName: contractName,
        eventName: eventAbi.name,
        eventAbi: eventAbi,
        ruleFn: ruleFn
      }
    })
  }
  return signatureLookup
}

/**
 * Builds a lookup object of marketplace contract names and versions
 * by ETH contract addresses.
 * @example
 * buildAddressToVersion()
 * //  { '0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF':
 * //      { versionKey: '000', contractName: 'V00_Marketplace' }
 * //  }
 */
async function buildAddressToVersion () {
  const versionList = {}
  const adapters = o.marketplace.resolver.adapters
  const versionKeys = Object.keys(adapters)
  for (const versionKey of versionKeys) {
    const adapter = adapters[versionKey]
    await adapter.getContract()
    const contract = adapter.contract
    versionList[contract._address] = {
      versionKey: versionKey,
      contractName: adapter.contractName
    }
  }
  return versionList
}

// ---------------------------
// Section 4: Run the listener
// ---------------------------

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const config = {
  // Unique id. Used to differentiate between the several listeners instances
  // that may run concurrently (ex: main vs webhook vs re-indexing).
  listenerId: args['--listener-id'] || process.env.LISTENER_ID || 'main',
  // Call webhook to process event.
  webhook: args['--webhook'] || process.env.WEBHOOK,
  // Call post to discord webhook to process event.
  discordWebhook: args['--discord-webhook'] || process.env.DISCORD_WEBHOOK,
  // Index events in the search index.
  elasticsearch: args['--elasticsearch'] || (process.env.ELASTICSEARCH === 'true'),
  // Index events in the database.
  db: args['--db'] || (process.env.DATABASE === 'true'),
  // Verbose mode, includes dumping events on the console.
  verbose: args['--verbose'] || (process.env.VERBOSE === 'true'),
  // File to use for picking which block number to restart from
  continueFile: args['--continue-file'] || process.env.CONTINUE_FILE,
  // Trail X number of blocks behind
  trailBlocks:
    parseInt(args['--trail-behind-blocks'] || process.env.TRAIL_BEHIND_BLOCKS || 0),
  // web3 provider url
  web3Url:
    args['--web3-url'] || process.env.WEB3_URL || 'http://localhost:8545',
  // ipfs url
  ipfsUrl: args['--ipfs-url'] || process.env.IPFS_URL || 'http://localhost:8080',
  // Origin-js configs
  arbitratorAccount: process.env.ARBITRATOR_ACCOUNT,
  affiliateAccount: process.env.AFFILIATE_ACCOUNT,
  blockEpoch: parseInt(process.env.BLOCK_EPOCH || 0),
  // Default continue block.
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0)
}

const port = 9499

app.listen({ port: port }, () => {
  console.log(`Serving Prometheus metrics on port ${port}`)
  // Start the listener.
  console.log(`Starting event-listener with config:\n${
    JSON.stringify(config, (k, v) => v === undefined ? null : v, 2)}`)
  liveTracking(config)
})
