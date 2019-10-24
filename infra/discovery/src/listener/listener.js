/**
 * Blockchain events listener.
 *
 * Guarantees to process blockchain events
 *  - At least once
 *  - In blockchain order
 *
 * TODO:
 *  - Handle blockchain splits/winners
 *  - Include current-as-of block numbers in POSTs
 *  - Perhaps send related data as it was at the time of the event, not as of crawl time
 */
const logger = require('./logger')

require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}

const Web3 = require('web3')
const pLimit = require('p-limit')
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const { blockGauge, errorCounter, metricsServer } = require('./metrics')
const { handleEvent } = require('./handler')
const { getLastBlock, setLastBlock, withRetrys } = require('./utils')

/**
 * Helper class passed to logic methods containing config and shared resources.
 */
class Context {
  constructor() {
    this.config = undefined
    this.web3 = undefined
    this.contracts = undefined
  }

  async init(config, contracts, errorCounter) {
    const web3Provider = new Web3.providers.HttpProvider(
      contractsContext.config.provider
    )
    this.web3 = new Web3(web3Provider)
    this.config = config
    this.config.networkId = await this.web3.eth.net.getId()
    this.contracts = contracts
    this.errorCounter = errorCounter
    return this
  }
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
  // Notification web hook URL. e.g. http://localhost:3456/events
  notificationsWebhook:
    args['--notifications-webhook'] || process.env.NOTIFICATIONS_WEBHOOK,
  // Discord webhook URL.
  discordWebhook: args['--discord-webhook'] || process.env.DISCORD_WEBHOOK,
  // Mailing list webhook URL.
  emailWebhook: args['--email-webhook'] || process.env.EMAIL_WEBHOOK,
  // Index events in the search index.
  elasticsearch:
    args['--elasticsearch'] || process.env.ELASTICSEARCH === 'true',
  // Google Cloud pub/sub topic
  gcloudPubsubTopic:
    args['--gcloud-pubsub-topic'] || process.env.GCLOUD_PUBSUB_TOPIC,
  // Google Cloud project id for pub/sub
  gcloudProjectId: args['--gcloud-project-id'] || process.env.GCLOUD_PROJECT_ID,
  // Index marketplace events.
  marketplace:
    args['--marketplace'] || process.env.INDEX_MARKETPLACE === 'true',
  // Index identity events.
  identity: args['--identity'] || process.env.INDEX_IDENTITY === 'true',
  // Index growth events.
  growth: args['--growth'] || process.env.INDEX_GROWTH === 'true',
  // Index identity proxy events.
  proxy: args['--proxy'] || process.env.INDEX_PROXY === 'true',
  // File to use for picking which block number to restart from
  continueFile: args['--continue-file'] || process.env.CONTINUE_FILE,
  // Warning: only use concurrency > 1 for backfills. Not under normal operation.
  concurrency: parseInt(args['--concurrency'] || process.env.CONCURRENCY || 1),
  // Possible values: origin, rinkeby, mainnet, ...
  network: args['--network'] || process.env.NETWORK || 'docker',
  // Default continue block
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0),
  enableMetrics:
    args['--enable-metrics'] || process.env.ENABLE_METRICS === 'true',
  messagingEvents: args['--messaging-events'] || process.env.MESSAGING_EVENTS
}

logger.info('Starting with configuration:')
logger.info(config)

/**
 * Creates runtime context and starts the tracking loop
 * @return {Promise<void>}
 */
async function main() {
  const context = await new Context().init(config, contractsContext, errorCounter)

  // List of contracts the listener watches events from.
  const contracts = {}
  if (config.identity)
    contracts['IdentityEvents'] = contractsContext.identityEvents
  //if (config.proxy) contracts['ProxyFactory'] = contractsContext.ProxyFactory

  if (config.marketplace) {
    // Listen to all versions of marketplace
    Object.keys(contractsContext.marketplaces).forEach(key => {
      contracts[`V${key}_Marketplace`] =
        contractsContext.marketplaces[key].contract
    })
  }

  if (context.config.concurrency > 1) {
    logger.warn(`Backfill mode: concurrency=${context.config.concurrency}`)
  }

  // Helper function to wait at most tickIntervalSeconds.
  const tickIntervalSeconds = 5
  let start

  async function nextTick() {
    const elapsed = new Date() - start
    const delay = Math.max(tickIntervalSeconds * 1000 - elapsed, 1)
    return new Promise(resolve => setTimeout(() => resolve(true), delay))
  }

  do {
    start = new Date()

    // Compute the range of blocks to process
    const toBlock = await withRetrys(async () => {
      return context.web3.eth.getBlockNumber()
    })

    for (const contractKey of Object.keys(contracts)) {
      let processedToBlock = await getLastBlock(
        context.config,
        `${contractKey}_`
      )
      logger.debug(`Processing from ${processedToBlock} for ${contractKey}`)

      // Listener is up to date. Nothing to do.
      if (toBlock <= processedToBlock) {
        logger.debug('No new blocks to process')
        continue
      }
      logger.info(
        `Querying events within interval (${processedToBlock}, ${toBlock})`
      )

      // Retrieve all events for the relevant contract
      const events = await withRetrys(async () => {
        return contracts[contractKey].eventCache.allEvents()
      })

      logger.debug(
        `Got ${events.length} unfiltered events within interval for ${contractKey}`
      )

      // Filter out events outside of interval (processedToBlock, toBlock].
      const newEvents = events.filter(
        event => event && event.blockNumber > processedToBlock
      )

      logger.info(`Got ${newEvents.length} new events for ${contractKey}`)

      if (context.config.concurrency > 1) {
        // Concurrency greater than 1 -> Backfill mode.
        const limit = pLimit(context.config.concurrency)
        const promises = []
        newEvents.forEach(newEvent => {
          promises.push(limit(() => handleEvent(newEvent, context)))
        })
        await Promise.all(promises).catch(err => {
          logger.error(`Unhandled error in event handler`)
          logger.error(err)
        })
      } else {
        // Have the handler process each event.
        for (const event of newEvents) {
          // Note: we purposely do not set the exitOnError option of withRetrys to false.
          // In case all retries fails, it indicates something is wrong at the system
          // level and a process restart may fix it.
          await withRetrys(async () => handleEvent(event, context))
        }
      }

      /**
       * Don't assume it's the latest block known above, but use the one from
       * event-cache
       */
      const latestIndexedBlock =
        contracts[contractKey].eventCache.latestIndexedBlock
      if (processedToBlock < latestIndexedBlock) {
        processedToBlock = latestIndexedBlock

        logger.debug(`Updating last processed block to ${processedToBlock}`)

        // Record state of processing
        await setLastBlock(context.config, processedToBlock, `${contractKey}_`)
        if (context.config.enableMetrics) {
          // TODO Separate for every contract?
          blockGauge.set(processedToBlock)
        }
      }
    }
  } while (await nextTick())
}

// Start the metrics server.
if (config.enableMetrics) {
  const port = 9499
  // Start express server for serving metrics
  metricsServer.listen({ port: port }, () => {
    logger.info(`Serving Prometheus metrics on port ${port}`)
  })
}

// Start the listener.
logger.info(
  `Starting event-listener with config: ${JSON.stringify(
    config,
    (k, v) => (v === undefined ? null : v),
    2
  )}`
)

setNetwork(config.network, {
  performanceMode: false,
  proxyAccountsEnabled: process.env.PROXY_ACCOUNTS_ENABLED === 'true'
})
main().catch(err => {
  logger.error('Error occurred in listener main() process:', err)
  logger.error('Exiting')
  process.exit(1)
})
