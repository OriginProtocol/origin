const esmImport = require('esm')(module)
const graphqlClient = esmImport('@origin/graphql').default

const logger = require('./logger')
const db = require('../models')
const { withRetrys } = require('./utils')
const MarketplaceEventHandler = require('./handler_marketplace')
const IdentityEventHandler = require('./handler_identity')

const {
  postToEmailWebhook,
  postToDiscordWebhook,
  postToWebhook,
  publishToGcloudPubsub
} = require('./webhooks')

// Adding a mapping here makes the listener listen for the event
// and call the associated handler when the event is received.
const EVENT_TO_HANDLER_MAP = {
  // Marketplace Events
  ListingCreated: MarketplaceEventHandler,
  ListingUpdated: MarketplaceEventHandler,
  ListingWithdrawn: MarketplaceEventHandler,
  ListingData: MarketplaceEventHandler,
  ListingArbitrated: MarketplaceEventHandler,
  OfferCreated: MarketplaceEventHandler,
  OfferWithdrawn: MarketplaceEventHandler,
  OfferAccepted: MarketplaceEventHandler,
  OfferDisputed: MarketplaceEventHandler,
  OfferRuling: MarketplaceEventHandler,
  OfferFinalized: MarketplaceEventHandler,
  OfferData: MarketplaceEventHandler,
  // Identity Events
  IdentityUpdated: IdentityEventHandler
  // TODO(franck): handle IdentityDeleted
}

/**
 *  Main entry point for processing events.
 *   - Logs the event in the DB.
 *   - Calls the event's handler.
 *   - Optionally calls webhooks.
 */
async function handleEvent(event, context) {
  // Fetch block to retrieve timestamp.
  let block
  await withRetrys(async () => {
    block = await context.web3.eth.getBlock(event.blockNumber)
  })
  const blockDate = new Date(block.timestamp * 1000)

  const eventDetails = `blockNumber=${event.blockNumber} \
    transactionIndex=${event.transactionIndex} \
    eventName=${event.event}`
  logger.info(`Processing event: ${eventDetails}`)

  // Record the event in the DB.
  await withRetrys(async () => {
    return db.Event.upsert({
      blockNumber: event.blockNumber,
      logIndex: event.logIndex,
      contractAddress: event.address,
      transactionHash: event.transactionHash,
      topic0: event.raw.topics[0],
      topic1: event.raw.topics[1],
      topic2: event.raw.topics[2],
      topic3: event.raw.topics[3],
      data: event,
      createdAt: blockDate
    })
  })

  // Call the event handler.
  //
  // Note: we run the handler with a retry since we've seen in production cases where we fail loading
  // from smart contracts the data pointed to by the event. This may occur due to load balancing
  // across ethereum nodes and if some nodes are lagging. For example the node we end up
  // connecting to for reading the data may lag compared to the node we received the event from.
  const handlerClass = EVENT_TO_HANDLER_MAP[event.event]
  if (!handlerClass) {
    logger.info(`No handler found for: ${event.event}`)
    return
  }

  const handler = new handlerClass(context.config, graphqlClient)

  let result
  try {
    await withRetrys(async () => {
      result = await handler.process(block, event)
    }, false)
  } catch (e) {
    logger.error(`Handler failed. Skipping log.`)
    context.errorCounter.inc()
    return
  }

  const output = {
    event: event,
    related: result
  }

  // Call the notification webhook
  const json = JSON.stringify(output, null, 2)
  logger.debug(`Handler result: ${json}`)

  if (handler.webhookEnabled() && context.config.webhook) {
    logger.info(`Webhook to ${context.config.webhook}`)
    try {
      await withRetrys(async () => {
        return postToWebhook(context.config.webhook, json)
      }, false)
    } catch (e) {
      logger.error(`Skipping webhook for ${eventDetails}`)
    }
  }

  // Call the add to email list webhook
  if (handler.emailWebhookEnabled() && context.config.emailWebhook) {
    logger.info(`Mailing list webhook to ${context.config.emailWebhook}`)
    try {
      await withRetrys(async () => {
        return postToEmailWebhook(context.config.emailWebhook, output)
      }, false)
    } catch (e) {
      logger.error(`Skipping email webhook for ${eventDetails}`)
    }
  }

  // Call the Discord webhook
  if (handler.discordWebhookEnabled() && context.config.discordWebhook) {
    logger.info(`Discord webhook to ${context.config.discordWebhook}`)
    try {
      await withRetrys(async () => {
        return postToDiscordWebhook(context.config.discordWebhook, output)
      }, false)
    } catch (e) {
      logger.error(`Skipping discord webhook for ${eventDetails}`)
    }
  }

  // Publish the output to Google Cloud Pub/sub
  if (handler.gcloudPubsubEnabled() && context.config.gcloudPubsubTopic) {
    logger.info(
      `Google Cloud Pub/Sub publish to ${context.config.gcloudPubsubTopic}`
    )
    try {
      await withRetrys(async () => {
        return publishToGcloudPubsub(
          context.config.gcloudProjectId,
          context.config.gcloudPubsubTopic,
          output
        )
      }, false)
    } catch (e) {
      logger.error(`Skipping Google Cloud Pub/Sub for ${eventDetails}`)
    }
  }

  return handler
}

module.exports = { handleEvent }
