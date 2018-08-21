const http = require('http')
const urllib = require('url')
const Web3 = require('web3')

const Origin = require('../../../dist/index') // FIXME: replace with origin-js package
const search = require ('../lib/search.js')
const db = require('../lib//db.js')

const web3Provider = new Web3.providers.HttpProvider('http://localhost:8545')
const web3 = new Web3(web3Provider)
const o = new Origin({
  ipfsDomain: 'origin-js',
  ipfsGatewayProtocol: 'http',
  ipfsGatewayPort: 8080,
  web3,
})

// Origin Listener
// ---------------
// An at-least-once event listener for origin events (May deliver an event more than once).
// Make sure your webhook endpoint is idempotent!
// Sends events along with all the related data.
// Designed to be infura compatible - API calls only, no subscriptions.
//
// To use:
// - Run `npm start run` to setup a local IPFS and blockchain, and run tests
// - In another terminal run `node scripts/listener.js`
// - Or `node scripts/listener.js --webhook=http://localhost/originevents/`
//
// Todo
// - Allow configuring web3 endpoint and IPFS endpoint
// - Handle errors
// - Persist starting point
// - Handle blockchain splits/winners
// - Include current-as-of block numbers in POSTs
// - Perhaps send related data as it was at the time of the event, not crawl time

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
  console.log("CALLING getListing for ID ", listingId)
  const listing = await o.marketplace.getListing(listingId)
  return {
    listing: listing,
  }
  //return {
  //  listing: await o.marketplace.getListing(generateListingId(log))
  //}
}
const getOfferDetails = async log => {
  return {
    listing: await o.marketplace.getListing(generateListingId(log)),
    offer: await o.marketplace.getOffer(generateOfferId(log))
  }
}

// Rules for acting on events
// Adding a rule here makes the listener listen for the event.
const LISTEN_RULES = {
  v00_MarketplaceContract: {
    ListingCreated: getListingDetails,
    ListingUpdated: getListingDetails,
    ListingWithdrawn: getListingDetails,
    ListingData: getListingDetails,
    ListingArbitrated: getListingDetails,
    OfferCreated: getListingDetails,
    OfferWithdrawn: getOfferDetails,
    OfferAccepted: getOfferDetails,
    OfferDisputed: getOfferDetails,
    OfferRuling: getOfferDetails,
    OfferFinalized: getOfferDetails,
    OfferData: getOfferDetails
  },
  v01_MarketplaceContract: {
    ListingCreated: getListingDetails,
    ListingUpdated: getListingDetails,
    ListingWithdrawn: getListingDetails,
    ListingData: getListingDetails,
    ListingArbitrated: getListingDetails,
    OfferCreated: getListingDetails,
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

// liveTracking
// - checks for a new block every checkIntervalSeconds
// - if new block appeared, look for all events after the last found event
async function liveTracking(config) {
  const context = await new Context(config).init()

  let lastLogBlock = 0
  let lastCheckedBlock = 0
  const checkIntervalSeconds = 5
  let start

  const check = async () => {
    start = new Date()
    const currentBlockNumber = await web3.eth.getBlockNumber()
    if (currentBlockNumber == lastCheckedBlock) {
      console.log('No new block.')
      return scheduleNextCheck()
    }
    console.log('New block: ' + currentBlockNumber)
    const opts = { fromBlock: lastLogBlock + 1 }
    const batchLastLogBlock = await runBatch(opts, context)
    if (batchLastLogBlock != undefined) {
      lastLogBlock = batchLastLogBlock
    }
    lastCheckedBlock = currentBlockNumber
    return scheduleNextCheck()
  }
  const scheduleNextCheck = async () => {
    const elapsed = new Date() - start
    const delay = Math.max(checkIntervalSeconds * 1000 - elapsed, 1)
    setTimeout(check, delay)
  }

  check()
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
    fromBlock: fromBlock,
    toBlock: toBlock,
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

// handleLog - annotates, runs rule, and ouputs a particular log
async function handleLog(log, rule, contractVersion, context) {
  console.log(`Processing log blockNumber=${log.blockNumber} transactionIndex=${log.transactionIndex}`)

  log.decoded = web3.eth.abi.decodeLog(
    rule.eventAbi.inputs,
    log.data,
    log.topics.slice(1)
  )
  log.contractName = contractVersion.contractName
  log.eventName = rule.eventName
  log.contractVersionKey = contractVersion.versionKey
  log.networkId = context.networkId

  const output = {
    log: log,
    related: await rule.ruleFn(log)
  }

  const json = JSON.stringify(output, null, 2)
  if (context.config.verbose) {
    console.log(json)
    console.log('\n----\n')
  }

  const userAddress = log.decoded.party
  const ipfsHash = log.decoded.ipfsHash

  //TODO: remove binary data from pictures in a proper way.
  let listing = output.related.listing
  delete listing.ipfsData.data.pictures
  const listingId = listing.id

  // Data consistency: check  listingId from the JSON stored in IPFS
  // matches with listingID emitted in the event.
  // TODO: use method utils/id.js:parseListingId
  const ipfsListingId = listingId.split('-')[2]
  if (ipfsListingId !== log.decoded.listingID) {
    throw error(`ListingId mismatch: ${ipfsListingId} !== ${log.decoded.listingID}`)
  }

  if (context.config.elasticsearch) {
    console.log("INDEXING ", listingId)
    await search.Listing.index(listingId, userAddress, ipfsHash, listing.ipfsData.data)
  }

  if (context.config.db) {
    await db.Listing.insert(listingId, userAddress, ipfsHash, listing.ipfsData.data)
  }

  if (context.config.webhook) {
    console.log('\n-- WEBHOOK to ' + context.config.webhook + ' --\n')
    await postToWebhook(context.config.webhook, json)
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
    const req = http.request(postOptions, res => {
      if(res.statusCode == 200){
        resolve()
      } else {
        reject()
      }
    })
    req.on('error', () => {
      reject()
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
    this.signatureToRules = buildSignatureLookup()
    this.addressToVersion = await buildVersionList()
    this.networkId = await web3.eth.net.getId()
    return this
  }
}

function buildSignatureLookup() {
  const signatureLookup = {}
  for (const contractName in LISTEN_RULES) {
    const eventRules = LISTEN_RULES[contractName]
    const contract = o.contractService[contractName]
    if(contract == undefined){
      throw "Can't find contract "+contractName
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
  const adapters = o.marketplace.adapters
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
  const argVal = (t.length > 1) ? t[1] : true
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
}
liveTracking(config)
