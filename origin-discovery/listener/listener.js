const fs = require('fs')
const http = require('http')
const https = require('https')
const urllib = require('url')
const Origin = require('origin')
const Web3 = require('web3')

const search = require('../lib/search.js')
const db = require('../lib//db.js')

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
  //return {
  //  listing: await o.marketplace.getListing(generateListingId(log))
  //}
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

// -------------------------------
// Section 2: The following engine
// -------------------------------

function setupOriginJS(config){
  const web3Provider = new Web3.providers.HttpProvider(config.web3Url)
  // global
  web3 = new Web3(web3Provider)
  console.log(`Web3 URL: ${config.web3Url}`)

  const ipfsUrl = urllib.parse(config.ipfsUrl)
  // global
  o = new Origin({
    ipfsDomain: ipfsUrl.hostname,
    ipfsGatewayProtocol: ipfsUrl.protocol.replace(':',''),
    ipfsGatewayPort: ipfsUrl.port,
    web3
  })
  console.log(`IPFS URL: ${config.ipfsUrl}`)
}

// liveTracking
// - checks for a new block every checkIntervalSeconds
// - if new block appeared, look for all events after the last found event
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
      const toBlock = Math.min(lastLogBlock+MAX_BATCH_BLOCKS, currentBlockNumber)
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

function setLastBlock(config, blockNumber) {
  if (config.continueFile == undefined) {
    return
  }
  const json = JSON.stringify({ lastLogBlock: blockNumber, version: 1 })
  fs.writeFileSync(config.continueFile, json, { encoding: 'utf8' })
}

// runBatch - gets and processes logs for a range of blocks
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

// Retrys up to 10 times, with exponential backoff
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
        console.log(`EXITING: Maximum number of retrys reached for ${fn.name}.`)
        // Now it's up to our environment to restart us.
        // Hopefully with a clean start, things will work better
        process.exit(1)
      } else {
        throw new Error(`Maximum number of retrys reached for ${fn.name}`)
      }
    }
  }
}

// handleLog - annotates, runs rule, and ouputs a particular log
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

  const logDetails = `blockNumber=${log.blockNumber} \
    transactionIndex=${log.transactionIndex} \
    eventName=${log.eventName} \
    contractName=${log.contractName}`
  console.log(`Processing log: $[logDetails}`)

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
    console.log(`Skipping indexing for ${logDetails}`)
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
    console.log(`Indexing listing in DB: id=${listingId}`)
    await withRetrys(async () => {
      await db.Listing.insert(
        listingId,
        userAddress,
        ipfsHash,
        listing.ipfs.data
      )
    })
  }

  if (context.config.webhook) {
    console.log('\n-- WEBHOOK to ' + context.config.webhook + ' --\n')
    await withRetrys(async () => {
      await postToWebhook(context.config.webhook, json)
    })
  }
}

async function postToWebhook(urlString, json) {
  const url = urllib.parse(urlString)
  const postOptions = {
    host: url.host,
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
      if (res.statusCode === 200) {
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
    this.addressToVersion = await buildVersionList()
    this.networkId = await web3.eth.net.getId()
    return this
  }
}

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

async function buildVersionList() {
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
  // Index events in the search index.
  elasticsearch: args['--elasticsearch'],
  // Index events in the database.
  db: args['--db'],
  // Verbose mode, includes dumping events on the console.
  verbose: args['--verbose'],
  // File to use for picking which block number to restart from
  continueFile: args['--continue-file'],
  // web3 provider url
  web3Url: args['--web3-url'] || 'http://localhost:8545',
  // ipfs url
  ipfsUrl: args['--ipfs-url'] || 'http://origin-js:8080',
}
liveTracking(config)
