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

const esmImport = require('esm')(module)
const graphqlClient = esmImport('@origin/graphql').default
const contractsContext = esmImport('@origin/graphql/src/contracts').default
const { setNetwork } = esmImport('@origin/graphql/src/contracts')

const { handleLog, EVENT_TO_HANDLER_MAP } = require('./handler')
const { getLastBlock, setLastBlock, withRetrys } = require('./utils')

setNetwork(process.env.NETWORK || 'docker')

/**
 * Builds a lookup object that allows you to start from an ETH event signature,
 * and find out what contract and what event fired it. Each event also includes a
 * list of our javascript event handler functions we want to fire for that log.
 * @example
 * buildSignatureToRules()
 *  { '0xec3d306143145322b45d2788d826e3b7b9ad062f16e1ec59a5eaba214f96ee3c':
 *      { Marketplace:
 *           { contractName: 'Marketplace',
 *             eventName: 'ListingCreated',
 *             eventAbi: [Object],
 *             handler: [...] } },
 *    '0x470503ad37642fff73a57bac35e69733b6b38281a893f39b50c285aad1f040e0':
 *       { Marketplace:
 *           { contractName: 'Marketplace',
 *             eventName: 'ListingUpdated',
 *             eventAbi: [Object],
 *             handler: [...] } }
 *  }
 */
function buildSignatureToRules(config) {
  const signatureLookup = {}

  for (const contractName in EVENT_TO_HANDLER_MAP) {
    const eventHandlers = EVENT_TO_HANDLER_MAP[contractName]
    const contract = contractsContext[contractName]
    if (contract === undefined) {
      throw Error("Can't find contract " + contractName)
    }

    const events = contract._jsonInterface.filter(x => x.type === 'event')
    events.forEach(eventAbi => {
      const handlerClass = eventHandlers[eventAbi.name]
      if (handlerClass === undefined) {
        return
      }
      // Instantiate a handler for this event type
      const handler = new handlerClass(config, graphqlClient)

      const signature = eventAbi.signature
      if (signatureLookup[signature] === undefined) {
        signatureLookup[signature] = {}
      }
      signatureLookup[signature][contract._address] = {
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
 * Helper class passed to logic methods containing config and shared resources.
 */
class Context {
  constructor() {
    this.config = undefined
    this.signatureToRules = undefined
  }

  async init(config, errorCounter) {
    this.config = config
    this.errorCounter = errorCounter
    this.signatureToRules = buildSignatureToRules(config, this.web3)
    return this
  }
}

async function pollForEvents(context) {
  let lastLogBlock = await getLastBlock(context.config)
  let lastCheckedBlock = 0

  // Make sure eventCache is synced
  // Do something on new events for events in EVENT_TO_HANDLER_MAP

  // Save the last checked block
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
  blockEpoch: parseInt(process.env.BLOCK_EPOCH || 0),
  // Default continue block.
  defaultContinueBlock: parseInt(process.env.CONTINUE_BLOCK || 0)
}

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
  pollForEvents(context)
}

app.listen({ port: port }, () => {
  logger.info(`Serving Prometheus metrics on port ${port}`)

  // Start the listener.
  logger.info(`Starting event-listener with config:\n
    ${JSON.stringify(config, (k, v) => (v === undefined ? null : v), 2)}`)
  main()
})
