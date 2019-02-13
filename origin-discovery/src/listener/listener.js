/**
 * Blockchain events listener.
 *
 * TODO:
 *  - Handle blockchain splits/winners
 *  - Include current-as-of block numbers in POSTs
 *  - Perhaps send related data as it was at the time of the event, not as of crawl time
 *  - Possible configurable log levels
 */
const logger = require('./logger')

require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}

const express = require('express')
const promBundle = require('express-prom-bundle')
const urllib = require('url')
const Origin = require('origin').default
const Web3 = require('web3')

const { handleLog, EVENT_TO_HANDLER_MAP } = require('./handler')
const { getLastBlock, setLastBlock, withRetrys } = require('./utils')

const MAX_BATCH_BLOCKS = 3000 // Adjust as needed as Origin gets more popular

/**
 * Builds a lookup object that allows you to start from an ETH event signature,
 * and find out what contract and what event fired it. Each event also includes a
 * list of our javascript event handler functions we want to fire for that log.
 * @example
 * buildSignatureToRules()
 *  { '0xec3d306143145322b45d2788d826e3b7b9ad062f16e1ec59a5eaba214f96ee3c':
 *      { V00_Marketplace:
 *           { contractName: 'V00_Marketplace',
 *             eventName: 'ListingCreated',
 *             eventAbi: [Object],
 *             handler: [...] } },
 *    '0x470503ad37642fff73a57bac35e69733b6b38281a893f39b50c285aad1f040e0':
 *       { V00_Marketplace:
 *           { contractName: 'V00_Marketplace',
 *             eventName: 'ListingUpdated',
 *             eventAbi: [Object],
 *             handler: [...] } }
 *  }
 */
function buildSignatureToRules (config, origin, web3) {
  const signatureLookup = {}
  for (const contractName in EVENT_TO_HANDLER_MAP) {
    const eventHandlers = EVENT_TO_HANDLER_MAP[contractName]
    const contract = origin.contractService.contracts[contractName]
    if (contract === undefined) {
      throw Error("Can't find contract " + contractName)
    }
    contract.abi.filter(x => x.type === 'event').forEach(eventAbi => {
      const handlerClass = eventHandlers[eventAbi.name]
      if (handlerClass === undefined) {
        return
      }
      const handler = new handlerClass(config, origin)
      const signature = web3.eth.abi.encodeEventSignature(eventAbi)
      if (signatureLookup[signature] === undefined) {
        signatureLookup[signature] = {}
      }
      signatureLookup[signature][contractName] = {
        contractName,
        eventName: eventAbi.name,
        eventAbi,
        handler
      }
    })
  }
  return signatureLookup
}

/**
 * Builds a lookup object of marketplace and identity contract names and versions
 * by ETH contract addresses.
 * @example
 * buildAddressToVersion()
 *  { '0xf25186B5081Ff5cE73482AD761DB0eB0d25abfBF':
 *      { versionKey: '000', contractName: 'V00_Marketplace' }
 *  }
 */
async function buildAddressToVersion (origin) {
  async function extractVersions(adapters, excludeVersions) {
    for (const versionKey of Object.keys(adapters)) {
      if (excludeVersions.includes(versionKey)) {
        continue
      }
      const adapter = adapters[versionKey]
      await adapter.getContract()
      const contract = adapter.contract
      versionList[contract._address] = {
        versionKey: versionKey,
        contractName: adapter.contractName
      }
    }
  }

  const versionList = {}
  await extractVersions(origin.marketplace.resolver.adapters, [])
  // Note: Ignore identity contract V00 since it is deprecated.
  await extractVersions(origin.users.resolver.adapters, ['000'])

  logger.debug('Contracts version list:', versionList)
  return versionList
}

/**
 * Creates an Origin object based on config.
 */
function setupOriginJS (config, web3) {
  const ipfsUrl = new urllib.URL(config.ipfsUrl)

  // Error out if any mandatory env var is not set.
  if (!config.arbitratorAccount) {
    throw new Error('ARBITRATOR_ACCOUNT not set')
  }
  if (!config.affiliateAccount) {
    throw new Error('AFFILIATE_ACCOUNT not set')
  }
  if (!config.attestationAccount) {
    throw new Error('ATTESTATION_ACCOUNT not set')
  }

  // Issue a warning for any recommended env var that is not set.
  if (!config.blockEpoch) {
    logger.warn('For performance reasons it is recommended to set BLOCK_EPOCH')
  }

  return new Origin({
    ipfsDomain: ipfsUrl.hostname,
    ipfsGatewayProtocol: ipfsUrl.protocol.replace(':', ''),
    ipfsGatewayPort: ipfsUrl.port,
    arbitrator: config.arbitratorAccount,
    affiliate: config.affiliateAccount,
    attestationAccount: config.attestationAccount,
    blockEpoch: config.blockEpoch,
    web3
  })
}

/**
 * Helper class passed to logic methods containing config and shared resources.
 */
class Context {
  constructor () {
    this.config = undefined
    this.web3 = undefined
    this.origin = undefined
    this.signatureToRules = undefined
    this.addressToVersion = undefined
    this.networkId = undefined
  }

  async init (config, errorCounter) {
    this.config = config
    this.errorCounter = errorCounter

    const web3Provider = new Web3.providers.HttpProvider(config.web3Url)
    this.web3 = new Web3(web3Provider)
    this.networkId = await this.web3.eth.net.getId()

    this.origin = setupOriginJS(config, this.web3)

    this.signatureToRules = buildSignatureToRules(config, this.origin, this.web3)
    this.addressToVersion = await buildAddressToVersion(this.origin)
    return this
  }
}

/**
 * runBatch - gets and processes logs for a range of blocks
 */
async function runBatch (opts, context) {
  const fromBlock = opts.fromBlock
  const toBlock = opts.toBlock
  let lastLogBlock

  logger.info(`Looking for logs from block ${fromBlock} to ${toBlock || 'Latest'}`)

  const eventTopics = Object.keys(context.signatureToRules)
  const logs = await context.web3.eth.getPastLogs({
    fromBlock: context.web3.utils.toHex(fromBlock), // Hex required for infura
    toBlock: toBlock ? context.web3.utils.toHex(toBlock) : 'latest', // Hex required for infura
    topics: [eventTopics]
  })

  if (logs.length > 0) {
    logger.info(`${logs.length} logs found`)
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
 *  liveTracking
 *  - checks for a new block every checkIntervalSeconds
 *  - if new block appeared, look for all events after the last found event
 */
async function liveTracking (context) {
  let lastLogBlock = await getLastBlock(context.config)
  let lastCheckedBlock = 0
  const checkIntervalSeconds = 5
  let start

  const check = async () => {
    await withRetrys(async () => {
      start = new Date()
      const currentBlockNumber = await context.web3.eth.getBlockNumber()
      if (currentBlockNumber === lastCheckedBlock) {
        logger.debug('No new block.')
        return scheduleNextCheck()
      }
      logger.info(`New block: ${currentBlockNumber}`)
      blockGauge.set(currentBlockNumber)
      const toBlock = Math.min(
        // Pick the smallest of either
        // the last log we processed, plus the max batch size
        lastLogBlock + MAX_BATCH_BLOCKS,
        // or the current block number, minus any trailing blocks we waiting on
        Math.max(currentBlockNumber - context.config.trailBlocks, 0)
      )
      const opts = { fromBlock: lastLogBlock + 1, toBlock: toBlock }
      await runBatch(opts, context)
      lastLogBlock = toBlock
      await setLastBlock(context.config, toBlock)
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

// ---------------------------
// Listener startup
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
  // Notification web hook URL.
  webhook: args['--webhook'] || process.env.WEBHOOK,
  // Discord webhook URL.
  discordWebhook: args['--discord-webhook'] || process.env.DISCORD_WEBHOOK,
  // Mailing list webhook URL.
  emailWebhook: args['--email-webhook'] || process.env.EMAIL_WEBHOOK,
  // Index events in the search index.
  elasticsearch: args['--elasticsearch'] || (process.env.ELASTICSEARCH === 'true'),
  // Index marketplace events.
  marketplace: args['--marketplace'] || (process.env.INDEX_MARKETPLACE === 'true'),
  // Index identity events.
  identity: args['--identity'] || (process.env.INDEX_IDENTITY === 'true'),
  // Index growth events.
  growth: args['--growth'] || (process.env.INDEX_GROWTH === 'true'),
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
  attestationAccount: process.env.ATTESTATION_ACCOUNT,
  blockEpoch: parseInt(process.env.BLOCK_EPOCH || 0),
  // Default continue block.
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0)
}

logger.debug("CONFIG", JSON.stringify(config))

const port = 9499

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

// Create metrics.
const blockGauge = new bundle.promClient.Gauge({
  name: 'event_listener_last_block',
  help: 'The last block processed by the event listener'
})

const errorCounter = new bundle.promClient.Counter({
  name: 'event_listener_handler_error',
  help: 'Number of errors from the event listener handler '
})

/**
 * Creates runtime context and starts the live tracking engine.
 * @return {Promise<void>}
 */
async function main() {
  const context = await new Context().init(config, errorCounter)
  liveTracking(context)
}

app.listen({ port: port }, () => {
  logger.info(`Serving Prometheus metrics on port ${port}`)

  // Start the listener.
  logger.info(`Starting event-listener with config:\n
    ${JSON.stringify(config, (k, v) => v === undefined ? null : v, 2)}`)
  main()
})