require('dotenv').config()

const logger = require('./logger')
try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured. Please set env var ENVKEY')
}

const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const _ = require('lodash')

// const { browserPush } = require('./browserPush')
const { transactionEmailSend, messageEmailSend } = require('./emailSend')
const { transactionMobilePush, messageMobilePush } = require('./mobilePush')
const MobileRegistry = require('./models').MobileRegistry

const { GrowthEventTypes } = require('@origin/growth-event/src/enums')
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')

const app = express()
const port = 3456
const emailAddress = process.env.VAPID_EMAIL_ADDRESS
let privateKey = process.env.VAPID_PRIVATE_KEY
let publicKey = process.env.VAPID_PUBLIC_KEY

if (!privateKey || !publicKey) {
  logger.warn(
    'Warning: VAPID public or private key not defined, generating one'
  )
  const vapidKeys = webpush.generateVAPIDKeys()
  publicKey = vapidKeys.publicKey
  privateKey = vapidKeys.privateKey
}

webpush.setVapidDetails(`mailto:${emailAddress}`, publicKey, privateKey)

const { processableEvent } = require('./notification')

// ------------------------------------------------------------------

// ---------------------------
// Notifications startup
// ---------------------------

const args = {}
process.argv.forEach(arg => {
  const t = arg.split('=')
  const argVal = t.length > 1 ? t[1] : true
  args[t[0]] = argVal
})

const networkDappDomains = {
  1: 'https://shoporigin.com',
  4: 'https://dapp.staging.originprotocol.com',
  2222: 'https://dapp.dev.originprotocol.com',
  999: 'http://localhost:3000'
}
const networkGatewayDomains = {
  1: 'https://ipfs.originprotocol.com',
  4: 'https://ipfs.staging.originprotocol.com',
  2222: 'https://ipfs.dev.originprotocol.com',
  999: 'http://localhost:8080'
}

const configOptions = {
  // Ethereum network we're on
  ethNetworkId: args['--eth-network-id'] || process.env.ETH_NETWORK_ID || 1,
  // Override email. All emails will be sent to this address, regardless of
  // actual intended email address.
  overrideEmail: args['--override-email'] || process.env.OVERRIDE_EMAIL || null,
  // Email account from whom emails will be sent
  fromEmail: args['--fromEmail'] || process.env.SENDGRID_FROM_EMAIL,
  // SendGrid ASM Group ID. Used for unsubscribing.
  asmGroupId: args['--asm-group-id'] || process.env.ASM_GROUP_ID || 9092,
  // Write emails to files, using this directory+prefix. e.g. "emails/finalized"
  emailFileOut: args['--email-file-out'] || process.env.EMAIL_FILE_OUT || null,
  // How far back in time to we look for duplicates?
  dupeLookbackMs:
    args['--dupe-lookback-ms'] || process.env.DUPE_LOOKBACK_MS || 1000 * 60 * 30
}
const config = {
  dappUrl: networkDappDomains[configOptions.ethNetworkId],
  ipfsGatewayUrl: networkGatewayDomains[configOptions.ethNetworkId],
  ...configOptions
}
logger.log(config)

// ------------------------------------------------------------------

// should be tightened up for security
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )

  next()
})

// Note: bump up default payload max size since the event-listener posts
// payload that may contain user profile with b64 encoded profile picture.
app.use(bodyParser.json({ limit: '10mb' }))

/**
 * Endpoint to dump all the subscriptions stored in the DB.
 * For development purposes only. Disabled in production.
 */
app.get('/', async (req, res) => {
  let markup =
    `<h1>Origin Notifications v${process.env.npm_package_version}</h1>` +
    `<p><a href="https://github.com/OriginProtocol/origin/issues/806">Learn More</a></p>`

  try {
    if (process.env.NODE_ENV === 'development') {
      const subs = await PushSubscription.findAll()

      markup += `<h3>${subs.length} Push Subscriptions</h3><ul>${subs.map(
        s =>
          `<li><pre style="white-space: pre-wrap;word-break: break-all">${JSON.stringify(
            s
          )}</pre></li>`
      )}</ul>`
    }
  } catch (error) {
    markup += `<p>Could not get subscriptions. Is postgres running and DATABASE_URL env var set?</p><p>Error returned was:</p><pre>${error}</pre>`
  }

  res.send(markup)
})

/**
 * Endpoint called by the DApp to record a subscription for an account.
 */
app.post('/', async (req, res) => {
  const { account, endpoint, keys } = req.body

  // Validate the input.
  // TODO: stricter validation of the account address validity using web3 util.
  if (!account || !endpoint || !keys) {
    return res.sendStatus(400)
  }

  // Normalize account.
  const normAccount = account.toLowerCase()

  // Looking existing subscription for this (account, endpoint) pair.
  const existing = await PushSubscription.findAll({
    where: { account: normAccount, endpoint }
  })

  // Nothing to do if there is already a subscription.
  if (existing.length > 0) {
    return res.sendStatus(200)
  }

  // Add the subscription to the DB.
  // Note: the expiration_time column is not populated - it is for future use.
  await PushSubscription.create({ account: normAccount, endpoint, keys })
  res.sendStatus(201)
})

/**
 * Endpoint called from the mobile marketplace app to register a device token
 * and Ethereum address.
 */
app.post('/mobile/register', async (req, res) => {
  logger.info('Call to mobile device registry endpoint')

  const mobileRegister = {
    ethAddress: req.body.eth_address,
    deviceType: req.body.device_type,
    deviceToken: _.get(req.body, 'device_token', null),
    permissions: req.body.permissions
  }

  // See if a row already exists for this device/address
  let registryRow = await MobileRegistry.findOne({
    where: {
      ethAddress: mobileRegister.ethAddress,
      deviceToken: mobileRegister.deviceToken
    }
  })

  if (!registryRow) {
    // Nothing exists, create a new row
    logger.debug('Adding new mobile device to registry: ', req.body)
    registryRow = await MobileRegistry.create(mobileRegister)

    // Record the mobile account creation in the growth_event table.
    await GrowthEvent.insert(
      logger,
      1,
      mobileRegister.ethAddress,
      GrowthEventTypes.MobileAccountCreated,
      mobileRegister.deviceToken,
      { deviceType: mobileRegister.deviceType },
      new Date()
    )

    res.sendStatus(201)
  } else {
    // Row exists, permissions might have changed, update if required
    logger.debug('Updating mobile device registry: ', req.body)
    registryRow = await MobileRegistry.upsert(mobileRegister)
    res.sendStatus(200)
  }
})

app.delete('/mobile/register', async (req, res) => {
  logger.info('Call to delete mobile registry endpoint')

  // See if a row already exists for this device/address
  const registryRow = await MobileRegistry.findOne({
    where: {
      ethAddress: req.body.eth_address,
      deviceToken: _.get(req.body, 'device_token', null)
    }
  })

  if (!registryRow) {
    res.sendStatus(204)
  } else {
    // Update the soft delete column
    await registryRow.update({ deleted: true })
    res.sendStatus(200)
  }
})

/**
 * Endpoint called by the messaging-server
 * list of eth address that have received a message
 */
app.post('/messages', async (req, res) => {
  res.status(200).send({ status: 'ok' })

  const sender = req.body.sender // eth address
  const receivers = req.body.receivers // array of eth addresses
  const messageHash = req.body.messageHash // hash of all message details

  if (!sender || !receivers) {
    console.warn('Invalid json received.')
    return
  }

  // Email notifications
  messageEmailSend(receivers, sender, messageHash, config)

  // Mobile Push notifications
  messageMobilePush(receivers, sender, messageHash, config)
})

/**
 * Endpoint called by the event-listener to notify
 * the notification server of a new event.
 * Sample json payloads in test/fixtures
 */
app.post('/events', async (req, res) => {
  // Source of queries, and resulting json structure:
  // https://github.com/OriginProtocol/origin/tree/master/infra/discovery/src/listener/queries

  const { event = {}, related = {} } = req.body
  const { returnValues = {} } = event
  const eventName = event.event
  const { listing, offer } = related
  const { seller = {} } = listing
  const buyer = offer ? offer.buyer : {} // Not all events have offers
  const eventDetailsSummary = `eventName=${eventName} blockNumber=${event.blockNumber} logIndex=${event.logIndex}`
  logger.info(`Info: Processing event ${eventDetailsSummary}`)

  // Return 200 to the event-listener without waiting for processing of the event.
  res.status(200).send({ status: 'ok' })

  // TODO: Temp hack for now that we only test for mobile messages.
  // Thats how the old listener decided if there was a message. Will do
  // now until we get real pipeline built.
  if (!processableEvent(eventName, 'mobile')) {
    logger.info(
      `Info: Not a processable event. Skipping ${eventDetailsSummary}`
    )
    return
  }

  if (!listing) {
    logger.error(`Error: Missing listing data. Skipping ${eventDetailsSummary}`)
    return
  }
  if (!seller.id) {
    logger.error(`Error: Missing seller.id. Skipping ${eventDetailsSummary}`)
    return
  }
  if (!buyer.id) {
    logger.error(`Error: Missing buyer.id. Skipping ${eventDetailsSummary}`)
    return
  }

  // ETH address of the party who initiated the action.
  // Could be the seller, buyer or a 3rd party (ex: arbitrator, affiliate, etc...).
  if (!returnValues.party) {
    logger.error(`Error: Invalid part, skipping ${eventDetailsSummary}`)
    return
  }

  // Normalize buyer, seller and party to use owner (aka "wallet") rather than proxy addresses.
  // The reason is that identity and notification data is stored under owner address.
  let party = returnValues.party.toLowerCase()
  if (party === buyer.identity.owner.proxy.id.toLowerCase()) {
    party = buyer.identity.owner.id.toLowerCase()
  } else if (party === seller.identity.owner.proxy.id.toLowerCase()) {
    party = seller.identity.owner.id.toLowerCase()
  }
  const buyerAddress = buyer.identity.owner.id
    ? buyer.identity.owner.id.toLowerCase()
    : null
  const sellerAddress = seller.identity.owner.id
    ? seller.identity.owner.id.toLowerCase()
    : null

  logger.info(`>eventName: ${eventName}`)
  logger.info(`>party: ${party}`)
  logger.info(`>buyerAddress: ${buyerAddress}`)
  logger.info(`>sellerAddress: ${sellerAddress}`)
  logger.info(`offer:`)
  logger.info(offer)
  logger.info(`listing:`)
  logger.info(listing)

  // Email notifications
  transactionEmailSend(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing,
    config
  )

  // Mobile Push notifications
  transactionMobilePush(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing,
    config
  )

  // Browser push subscripttions
  // browserPush(eventName, party, buyerAddress, sellerAddress, offer)
})

app.listen(port, () =>
  logger.info(`Notifications server listening at http://localhost:${port}`)
)

module.exports = app
