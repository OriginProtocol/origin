require('dotenv').config()

const fs = require('fs')
const http = require('http')
const https = require('https')
const urllib = require('url')
const Origin = require('origin')
const Web3 = require('web3')

const search = require('../lib/search.js')
const db = require('../models')

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

MAX_RETRYS = 10
MAX_RETRY_WAIT_MS = 2 * 60 * 1000
MAX_BATCH_BLOCKS = 3000 // Adjust as needed as Origin gets more popular

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
  let seller = undefined
  try {
    seller = await o.users.get(listing.seller)
  } catch(e) {
    console.log("Failed to fetch seller", e)
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
  let seller = undefined
  let buyer = undefined
  try {
    seller = await o.users.get(listing.seller)
  } catch(e) {
    // If fetching the seller fails, we still want to index the listing/offer
    console.log("Failed to fetch seller", e)
  }
  try {
    buyer = await o.users.get(offer.buyer)
  } catch(e) {
    // If fetching the buyer fails, we still want to index the listing/offer
    console.log("Failed to fetch buyer", e)
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
function setupOriginJS(config){
  const web3Provider = new Web3.providers.HttpProvider(config.web3Url)
  // global
  web3 = new Web3(web3Provider)
  console.log(`Web3 URL: ${config.web3Url}`)

  const ipfsUrl = urllib.parse(config.ipfsUrl)
  console.log(`IPFS URL: ${config.ipfsUrl}`)

  // Error out if any mandatory env var is not set.
  if (!process.env.ARBITRATOR_ACCOUNT) {
    throw new Error('ARBITRATOR_ACCOUNT not set')
  }
  if (!process.env.AFFILIATE_ACCOUNT) {
    throw new Error('AFFILIATE_ACCOUNT not set')
  }

  // Issue a warning for any recommended env var that is not set.
  if (!process.env.BLOCK_EPOCH) {
    console.log('WARNING: For performance reason it is recommended to set BLOCK_EPOCH')
  }

  // global
  o = new Origin({
    ipfsDomain: ipfsUrl.hostname,
    ipfsGatewayProtocol: ipfsUrl.protocol.replace(':',''),
    ipfsGatewayPort: ipfsUrl.port,
    arbitrator: process.env.ARBITRATOR_ACCOUNT,
    affiliate: process.env.AFFILIATE_ACCOUNT,
    blockEpoch: process.env.BLOCK_EPOCH || 0,
    web3
  })
}

/**
 *  liveTracking
 * - checks for a new block every checkIntervalSeconds
 * - if new block appeared, look for all events after the last found event
 */ 
async function liveTracking(config) {
  setupOriginJS(config)
  const context = await new Context(config).init()

  let lastLogBlock = getLastBlock(config)
  let lastCheckedBlock = 0
  const checkIntervalSeconds = 5
  let start

  const check = async () => {
    await withRetrys(async () => {
      start = new Date()
      const currentBlockNumber = await web3.eth.getBlockNumber()
      if (currentBlockNumber == lastCheckedBlock) {
        console.log('No new block.')
        return scheduleNextCheck()
      }
      console.log('New block: ' + currentBlockNumber)
      const toBlock = Math.min( // Pick the smallest of either
        // the last log we processed, plus the max batch size
        lastLogBlock + MAX_BATCH_BLOCKS, 
         // or the current block number, minus any trailing blocks we waiting on
        Math.max(currentBlockNumber - config.trailBlocks, 0),
      )
      const opts = { fromBlock: lastLogBlock + 1, toBlock: toBlock }
      await runBatch(opts, context)
      lastLogBlock = toBlock
      setLastBlock(config, toBlock)
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
 * The first block the listener should start at for following events.
 * This either uses the value stored in the the continue file, if given
 * or defaults to 0.
 */ 
function getLastBlock(config) {
  if (config.continueFile == undefined || !fs.existsSync(config.continueFile)) {
    return 0
  }
  const json = fs.readFileSync(config.continueFile, { encoding: 'utf8' })
  const data = JSON.parse(json)
  if (data.lastLogBlock) {
    return data.lastLogBlock
  }
  return 0
}

/**
 * Stores the last block we have read up to in the continue file.
 * If no continue file configured, does nothing.
 */  
function setLastBlock(config, blockNumber) {
  if (config.continueFile == undefined) {
    return
  }
  const json = JSON.stringify({ lastLogBlock: blockNumber, version: 1 })
  fs.writeFileSync(config.continueFile, json, { encoding: 'utf8' })
}

/**
 * runBatch - gets and processes logs for a range of blocks
 */ 
async function runBatch(opts, context) {
  const fromBlock = opts.fromBlock
  const toBlock = opts.toBlock
  let lastLogBlock = undefined

  console.log(
    'Looking for logs from block ' + fromBlock + ' to ' + (toBlock || 'Latest')
  )

  const eventTopics = Object.keys(context.signatureToRules)
  const logs = await web3.eth.getPastLogs({
    fromBlock: web3.utils.toHex(fromBlock), // Hex required for infura
    toBlock: toBlock ? web3.utils.toHex(toBlock) : "latest",  // Hex required for infura
    topics: [eventTopics]
  })

  if (logs.length > 0) {
    console.log('' + logs.length + ' logs found')
  }

  for (const log of logs) {
    const contractVersion = context.addressToVersion[log.address]
    if (contractVersion == undefined) {
      continue // Skip - Not a trusted contract
    }
    const contractName = contractVersion.contractName
    const rule = context.signatureToRules[log.topics[0]][contractName]
    if (rule == undefined) {
      continue // Skip - No handler defined
    }
    lastLogBlock = log.blockNumber
    // Process it
    await handleLog(log, rule, contractVersion, context)
  }
  return lastLogBlock
}

/**
 * Retrys up to N times, with exponential backoff.
 * If still failing after N times, exits the process.
 */ 
async function withRetrys(fn, exitOnError=true) {
  let tryCount = 0
  while (true) {
    try {
      return await fn() // Do our action.
    } catch (e) {
      // Roughly double wait time each failure
      let waitTime = Math.pow(100, 1 + tryCount / 6)
      // Randomly jiggle wait time by 20% either way. No thundering herd.
      waitTime = Math.floor(waitTime * (1.2 - Math.random() * 0.4))
      // Max out at two minutes
      waitTime = Math.min(waitTime, MAX_RETRY_WAIT_MS)
      console.log('ERROR', e)
      console.log(`will retry in ${waitTime / 1000} seconds`)
      tryCount += 1
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    if (tryCount >= MAX_RETRYS) {
      if (exitOnError) {
        console.log('EXITING: Maximum number of retrys reached')
        // Now it's up to our environment to restart us.
        // Hopefully with a clean start, things will work better
        process.exit(1)
      } else {
        throw new Error('Maximum number of retrys reached')
      }
    }
  }
}

/**
 *  Takes and event/log and a matching rule 
 *  then annotates the event/log, runs the rule, and ouputs everything.
 */ 
async function handleLog(log, rule, contractVersion, context) {
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
  log.date = new Date(log.timestamp*1000)

  const logDetails = `blockNumber=${log.blockNumber} \
    transactionIndex=${log.transactionIndex} \
    eventName=${log.eventName} \
    contractName=${log.contractName}`
  console.log(`Processing log: ${logDetails}`)

  if (context.config.db) {
    // Store the event in the database.
    // Generate a unique id based on concatenation of blockNumber and logIndex.
    // Numbers are left padded to preserve ordering.
    const logId =
      log.blockNumber.toString().padStart(10, '0') + '-' +
      log.logIndex.toString().padStart(5, '0')
    await withRetrys(async () => {
      await db.Event.insertOrUpdate({
        id: logId,
        contractAddress: log.address,
        transactionHash: log.transactionHash,
        blockNumber: log.blockNumber,
        topic0: log.topics[0],
        topic1: log.topics[1],
        topic2: log.topics[2],
        topic3: log.topics[3],
        data: log,
        createdAt: log.date,
      })
    })
  }

  // Note: we run the rule with a retry since we've seen in production cases where we fail loading
  // from smart contracts the data pointed to by the event. This may occur due to load balancing
  // across ethereum nodes and if some nodes are lagging. For example the ethereum node we
  // end up connecting to for reading the data may lag compared to the node received the event from.
  let ruleResults = undefined
  try {
    await withRetrys(async () => {
      ruleResults = await rule.ruleFn(log)
    }, exitOnError = false)
  } catch(e) {
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

  //TODO: remove binary data from pictures in a proper way.
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
    throw `ListingId mismatch: ${ipfsListingId} !== ${log.decoded.listingID}`
  }

  // TODO: This kind of verification logic should live in origin.js
  if(output.related.listing.ipfs.data.price === undefined){
    console.log(`ERROR: listing ${listingId} has no price. Skipping indexing.`)
    return
  }

  if (context.config.elasticsearch) {
    console.log(`Indexing listing in Elastic: id=${listingId}`)
    await withRetrys(async () => {
      await search.Listing.index(
        listingId,
        userAddress,
        ipfsHash,
        listing
      )
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
      listingData = {
        id: listingId,
        status: listing.status,
        sellerAddress: listing.seller.toLowerCase(),
        data: listing,
      }
      if (rule.eventName === 'ListingCreated') {
        listingData.createdAt = log.date
      } else {
        listingData.updatedAt = log.date
      }
      await withRetrys(async () => {
        await db.Listing.insertOrUpdate(listingData)
      })
    }

    if (OFFER_EVENTS.includes(rule.eventName)) {
      const offer = output.related.offer
      console.log(`Indexing offer in DB: id=${offer.id}`)
      offerData = {
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
        await db.Offer.insertOrUpdate(offerData)
      })
    }
  }

  if (context.config.webhook) {
    console.log('\n-- WEBHOOK to ' + context.config.webhook + ' --\n')
    await withRetrys(async () => {
      await postToWebhook(context.config.webhook, json)
    })
  }

  if (context.config.discordWebhook) {
    postToDiscordWebhook(context.config.discordWebhook, output)
    console.log('\n-- Discord WEBHOOK to ' + context.config.discordWebhook + ' --')
  }
}

/**
 * Posts a to discord channel via webhook.
 * This functionality should move out of the listener 
 * to the notification system, as soon as we have one.
 */
 async function postToDiscordWebhook(discordWebhookUrl, data){
  const eventIcons = {
    ListingCreated: ':trumpet:',
    ListingUpdated: ':saxophone:',
    ListingWithdrawn: ':x:',
    ListingData: ':cd:',
    ListingArbitrated: ':boxing_glove:',
    OfferCreated: ':baby_chick:',
    OfferWithdrawn: ':feet:',
    OfferAccepted: ':bird:',
    OfferDisputed: ':dragon_face:',
    OfferRuling: ':dove:',
    OfferFinalized: ':unicorn:',
    OfferData: ':beetle:'
  }

  const personDisp = (p)=> {
    let str = ''
    if(p.profile && (p.profile.firstName || p.profile.lastName)){
      str += `${p.profile.firstName|''} ${p.profile.lastName||''} - `
    }
    str += p.address
    return str
  }
  const priceDisp = (listing) => {
    const price = listing.price
    return (price ? `${price.amount}${price.currency}` : '')
  }

  const icon = eventIcons[data.log.eventName] || ':dromedary_camel: '
  const lines = []
  const listing = data.related.listing
  
  let discordData = {}

  if (data.related.offer !== undefined) { // Offer
    discordData = {
      "embeds":[
        {
          "title":`${icon} ${data.log.eventName} - ${listing.title} - ${priceDisp(listing)}`,
          "description":[
            `https://dapp.originprotocol.com/#/purchases/${data.related.offer.id}`,
            `Seller: ${personDisp(data.related.seller)}`,
            `Buyer: ${personDisp(data.related.buyer)}`
          ].join("\n")
        }
      ]
    }
  } else { // Listing
    discordData = {
      "embeds":[
        {
          "title":`${icon} ${data.log.eventName} - ${listing.title} - ${priceDisp(listing)}`,
          "description":[
            `${listing.description.split("\n")[0].slice(0, 60)}...`,
            `https://dapp.originprotocol.com/#/listing/${listing.id}`,
            `Seller: ${personDisp(data.related.seller)}`,
          ].join("\n")
        }
      ]
    }
  }
  await postToWebhook(discordWebhookUrl, JSON.stringify(discordData))
 }


/**
 * Sends a blob of json to a webhook.
 */  
async function postToWebhook(urlString, json) {
  const url = urllib.parse(urlString)
  const postOptions = {
    host: url.hostname,
    port: url.port,
    path: url.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json)
    }
  }
  return new Promise((resolve, reject) => {
    const client = url.protocol === 'https:' ? https : http
    const req = client.request(postOptions, res => {
      console.log(res.statusCode )
      if (res.statusCode === 200 || res.statusCode === 204) {
        resolve()
      } else {
        reject()
      }
    })
    req.on('error', (err) => {
      reject(err)
    })
    req.write(json)
    req.end()
  })
}

// -------------------------------------------------------------------
// Section 3: Getting the contract information we need to track events
// -------------------------------------------------------------------

class Context {
  constructor(config) {
    this.config = config
    this.signatureToRules = undefined
    this.addressToVersion = undefined
    this.networkId = undefined
  }

  async init() {
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
function buildSignatureToRules() {
  const signatureLookup = {}
  for (const contractName in LISTEN_RULES) {
    const eventRules = LISTEN_RULES[contractName]
    const contract = o.contractService.contracts[contractName]
    if (contract == undefined) {
      throw Error("Can't find contract " + contractName)
    }
    contract.abi.filter(x => x.type == 'event').forEach(eventAbi => {
      const ruleFn = eventRules[eventAbi.name]
      if (ruleFn == undefined) {
        return
      }
      const signature = web3.eth.abi.encodeEventSignature(eventAbi)
      if (signatureLookup[signature] == undefined) {
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
async function buildAddressToVersion() {
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
  // Call webhook to process event.
  webhook: args['--webhook'],
  // Call post to discord webhook to process event.
  discordWebhook: args['--discord-webhook'],
  // Index events in the search index.
  elasticsearch: args['--elasticsearch'],
  // Index events in the database.
  db: args['--db'],
  // Verbose mode, includes dumping events on the console.
  verbose: args['--verbose'],
  // File to use for picking which block number to restart from
  continueFile: args['--continue-file'],
  // Trail X number of blocks behind
  trailBlocks: args['--trail-behind-blocks'] || 0,
  // web3 provider url
  web3Url: args['--web3-url'] || 'http://localhost:8545',
  // ipfs url
  ipfsUrl: args['--ipfs-url'] || 'http://localhost:8080',
}

// Start the listener running
liveTracking(config)
