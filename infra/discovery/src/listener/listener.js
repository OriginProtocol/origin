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
const sortBy = require('lodash/sortBy')
const esmImport = require('esm')(module)
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const { blockGauge, errorCounter } = require('./metrics')
const { handleEvent } = require('./handler')
const { getLastBlock, setLastBlock, withRetrys } = require('./utils')

/**
 * Helper class passed to logic methods containing config and shared resources.
 */
class Context {
  constructor() {
    this.config = undefined
    this.web3 = undefined
  }

  async init(config, errorCounter) {
    const web3Provider = new Web3.providers.HttpProvider(
      contractsContext.config.provider
    )
    this.web3 = new Web3(web3Provider)
    this.config = config
    this.config.networkId = await this.web3.eth.net.getId()
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
  // Notification web hook URL.
  webhook: args['--webhook'] || process.env.WEBHOOK,
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
  // File to use for picking which block number to restart from
  continueFile: args['--continue-file'] || process.env.CONTINUE_FILE,
  // Trail X number of blocks behind
  trailBlocks: parseInt(
    args['--trail-behind-blocks'] || process.env.TRAIL_BEHIND_BLOCKS || 0
  ),
  // Warning: only use concurrency > 1 for backfills. Not under normal operation.
  concurrency: parseInt(args['--concurrency'] || process.env.CONCURRENCY || 1),
  // Possible values: origin, rinkeby, mainnet, ...
  network: args['--network'] || process.env.NETWORK || 'docker',
  // Default continue block
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0)
}

/**
 * Creates runtime context and starts the tracking loop
 * @return {Promise<void>}
 */
async function main() {
  const context = await new Context().init(config, errorCounter)

  let processedToBlock = await getLastBlock(context.config)
  logger.info(`Resuming processing from ${processedToBlock}`)

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

    // Compute the range of blocks to process,
    // while respecting trailing block configuration.
    const currentBlock = await context.web3.eth.getBlockNumber()
    const toBlock = Math.max(currentBlock - context.config.trailBlocks, 0)

    // Listener is up to date. Nothing to do.
    if (toBlock <= processedToBlock) {
      logger.debug('No new blocks to process')
      continue
    }
    logger.info(`Querying events from ${processedToBlock} up to ${toBlock}`)

    // Update the event caches to set their max block number.
    contractsContext.marketplace.eventCache.updateBlock(toBlock)
    contractsContext.identityEvents.eventCache.updateBlock(toBlock)

    // Retrieve all events for the relevant contracts
    const eventArrays = await Promise.all([
      contractsContext.marketplace.eventCache.allEvents(),
      contractsContext.identityEvents.eventCache.allEvents()
    ])

    // Flatten array of arrays filtering out anything undefined
    const events = [].concat(...eventArrays.filter(x => x))
    // Filter to only new events
    let newEvents = events.filter(event => event.blockNumber > processedToBlock)
    logger.debug(`Got ${newEvents.length} new events`)

    if (context.config.concurrency > 1) {
      // Concurrency greater than 1 -> Backfill mode.
      const limit = pLimit(context.config.concurrency)
      const promises = []
      newEvents.forEach(newEvent => {
        promises.push(limit(() => handleEvent(newEvent, context)))
      })
      await Promise.all(promises)
    } else {
      // Concurrency set to 1 -> Normal operation mode.
      // Sort events by blockNumber and logIndex to process them in order.
      // In normal operation (not backfill), ordering does matter for handlers.
      // For example assume a buyer updates their identity to add their email
      // then makes a purchase. If the handler would process the purchase
      // event before the identity update, we may not be able to send the buyer
      // a confirmation email about their offer.
      newEvents = sortBy(newEvents, ['blockNumber', 'logIndex'], ['asc', 'asc'])

      // Have the handler process each event.
      for (const event of newEvents) {
        // Note: we purposely do not set the exitOnError option of withRetrys to false.
        // In case all retries fails, it indicates something is wrong at the system
        // level and a process restart may fix it.
        await withRetrys(async () => {
          handleEvent(event, context)
        })
      }
    }

    // Record state of processing
    logger.debug(`Updating last processed block to ${toBlock}`)
    await setLastBlock(context.config, toBlock)
    processedToBlock = toBlock
    blockGauge.set(toBlock)
  } while (await nextTick())
}

// Start the listener.
logger.info(`Starting event-listener with config:\n
  ${JSON.stringify(config, (k, v) => (v === undefined ? null : v), 2)}`)

setNetwork(config.network)
main()
