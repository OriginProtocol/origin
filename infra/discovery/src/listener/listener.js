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
const Web3 = require('web3')

const esmImport = require('esm')(module)
const graphqlClient = esmImport('@origin/graphql').default
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const { handleEvent } = require('./handler')
const { getLastBlock, setLastBlock, withRetrys } = require('./utils')

const MAX_BATCH_BLOCKS = 3000 // Adjust as needed as Origin gets more popular

/**
 * Helper class passed to logic methods containing config and shared resources.
 */
class Context {
  constructor() {
    this.config = undefined
    this.web3 = undefined
    this.networkId = undefined
  }

  async init(config, errorCounter) {
    const web3Provider = new Web3.providers.HttpProvider(config.providerUrl)
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
  providerUrl:
    args['--provider-url'] ||
    process.env.PROVIDER_URL ||
    'http://localhost:8545',
  network: args['--network'] || process.env.NETWORK || 'docker',
  blockEpoch: parseInt(process.env.BLOCK_EPOCH || 0),
  // Default continue block.
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0)
}

setNetwork(config.network)

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
 * Creates runtime context and starts the tracking loop
 * @return {Promise<void>}
 */
async function main() {
  const context = await new Context().init(config, errorCounter)
  let lastProcessedBlock = await getLastBlock(context.config)
  logger.info(`Resuming processing from ${lastProcessedBlock}`)
  const checkIntervalSeconds = 5
  let start

  const check = async () => {
    await withRetrys(async () => {
      start = new Date()
      let currentBlock = await context.web3.eth.getBlockNumber()
      if (currentBlock === lastProcessedBlock) {
        logger.debug('No new blocks to process')
        return scheduleNextCheck()
      }
      let fromBlock = lastProcessedBlock + 1
      // Respect the trailBlocks option
      let toBlock = Math.max(currentBlock - context.config.trailBlocks, 0)
      logger.debug(`Querying events from ${fromBlock} to ${toBlock}`)
      const newEventArrays = await Promise.all([
        contractsContext.marketplace.eventCache.getPastEvents(
          fromBlock,
          toBlock
        ),
        contractsContext.identityEvents.eventCache.getPastEvents(
          fromBlock,
          toBlock
        )
      ])
      // Flatten array of arrays filtering out anything undefined
      const newEvents = [].concat(...newEventArrays.filter(x => x))
      newEvents.map(event => handleEvent(event, context))
      // Record state of processing
      lastLogBlock = toBlock
      logger.debug(`Updating last processed block to ${toBlock}`)
      await setLastBlock(context.config, toBlock)
      lastProcessedBlock = currentBlock
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

app.listen({ port: port }, () => {
  logger.info(`Serving Prometheus metrics on port ${port}`)

  // Start the listener.
  logger.info(`Starting event-listener with config:\n
    ${JSON.stringify(config, (k, v) => (v === undefined ? null : v), 2)}`)
  main()
})
