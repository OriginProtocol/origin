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
const web3Utils = require('web3-utils')
const _ = require('lodash')

// const { browserPush } = require('./browserPush')
const MobilePush = require('./mobilePush')
const EmailSender = require('./emailSend')
const MobileRegistry = require('./models').MobileRegistry
const { GrowthEventTypes } = require('@origin/growth-event/src/enums')
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')

const authMiddleware = require('@origin/auth-utils/src/middleware/auth.non-strict')

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

//
// TODO:
//  - Use express-validator for route arguments validation.
//  - Add some sort of authentication to the /mobile/register route.
//

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
 * and Ethereum address for push notifications.
 *
 * Notes:
 *  - The app may call this end point more than once.
 *  - On iOS devices, the app may call this endpoint before the user accepts
 *    to turn on notifications. So the deviceToken argument may be empty.
 */
app.post('/mobile/register', authMiddleware, async (req, res) => {
  const mobileRegister = {
    ethAddress: req.__originAuth.address,
    deviceType: _.get(req.body, 'device_type', null),
    deviceToken: _.get(req.body, 'device_token', null),
    referralCode: _.get(req.body, 'referral_code', null),
    permissions: _.get(req.body, 'permissions', null)
  }
  logger.info(`POST /mobile/register for ${mobileRegister.ethAddress}`)

  if (
    !mobileRegister.ethAddress ||
    !web3Utils.isAddress(mobileRegister.ethAddress)
  ) {
    return res.status(400).send({ errors: ['Invalid Eth address'] })
  }
  // By convention all Eth addresses are stored lower cased in the DB.
  mobileRegister.ethAddress = mobileRegister.ethAddress.toLowerCase()

  if (mobileRegister.deviceToken) {
    // See if a row already exists for this (Eth address, device token) pair.
    const registryRow = await MobileRegistry.findOne({
      where: {
        ethAddress: mobileRegister.ethAddress,
        deviceToken: mobileRegister.deviceToken
      }
    })

    if (!registryRow) {
      // Nothing exists, create a new row.
      await MobileRegistry.create(mobileRegister)
      res.sendStatus(201)
      logger.debug('Added new mobile device to registry: ', req.body)
    } else {
      // Update existing row if the permissions have changed.
      if (
        JSON.stringify(mobileRegister.permissions) !==
        JSON.stringify(registryRow.permissions)
      ) {
        await registryRow.update({ permissions: mobileRegister.permissions })
        logger.debug('Updated mobile device registry: ', req.body)
      } else {
        logger.debug('Mobile registry up to date. No update needed.')
      }
      res.sendStatus(200)
    }
  }

  // Record the mobile account creation in the growth_event table.
  // Notes:
  //  - deviceToken may be null. Not an issue since it is just informational
  //    metadata that is not used.
  //  - The insert method is idempotent. It checks for existing rows before
  //    inserting, so it's alright to call it every time /mobile/register
  //    gets executed.
  const now = new Date()
  await GrowthEvent.insert(
    logger,
    1,
    mobileRegister.ethAddress,
    GrowthEventTypes.MobileAccountCreated,
    mobileRegister.deviceToken,
    { deviceType: mobileRegister.deviceType },
    now
  )
  logger.debug(
    `Recorded mobile account creation for ${mobileRegister.ethAddress} in growth system.`
  )
  // This one's for partner referral bonus
  if (mobileRegister.referralCode) {
    await GrowthEvent.insert(
      logger,
      1,
      mobileRegister.ethAddress,
      GrowthEventTypes.PartnerReferral,
      mobileRegister.referralCode,
      null,
      now
    )
    logger.debug(`Recorded partner referral with code ${mobileRegister.referralCode}.`)
  }
})

/**
 * Unregisters a device for push notifications.
 */
app.delete('/mobile/register', authMiddleware, async (req, res) => {
  const mobileRegister = {
    ethAddress: req.__originAuth.address,
    deviceToken: _.get(req.body, 'device_token', null)
  }
  logger.info(`DELETE /mobile/register for ${mobileRegister.ethAddress}`)

  if (
    !mobileRegister.ethAddress ||
    !web3Utils.isAddress(mobileRegister.ethAddress)
  ) {
    return res.status(400).send({ errors: ['Invalid Eth address'] })
  }
  // To unregister a deviceToken must be passed.
  if (!mobileRegister.deviceToken) {
    return res.sendStatus(204)
  }
  // By convention all Eth addresses are stored lower case in the DB.
  mobileRegister.ethAddress = mobileRegister.ethAddress.toLowerCase()

  // See if a row already exists for this device/address
  const registryRow = await MobileRegistry.findOne({
    where: {
      ethAddress: mobileRegister.ethAddress,
      deviceToken: mobileRegister.deviceToken
    }
  })

  if (!registryRow) {
    res.sendStatus(204)
    logger.debug('Device not registered. Nothing to do !')
  } else {
    // Update the soft delete column
    await registryRow.update({ deleted: true })
    res.sendStatus(200)
    logger.debug('Device unregistered.')
  }
})

/**
 * Endpoint called by the messaging-server with a list of eth addresses that
 * have received a message from a sender.
 *
 * Sends an email and mobile push notification to the receivers.
 */
app.post('/messages', async (req, res) => {
  const sender = req.body.sender // eth address
  const receivers = req.body.receivers // array of eth addresses
  const messageHash = req.body.messageHash // hash of all message details

  if (!sender || !receivers) {
    logger.warn('Invalid json received.')
    return res.status(400).send({ errors: ['Invalid sender or receivers'] })
  }

  // Email notifications
  await new EmailSender(config).sendMessageEmail(receivers, sender, messageHash)

  // Mobile Push notifications
  await new MobilePush(config).sendMessageNotification(
    receivers,
    sender,
    messageHash
  )

  res.status(200).send({ status: 'ok' })
})

/**
 * Endpoint called by the event-listener to notify
 * the notification server of a new event.
 * Sample json payloads in test/fixtures
 *
 * Sends the buyer and seller and email and a mobile push notification.
 */
app.post('/events', async (req, res) => {
  // Source of queries, and resulting json structure:
  // https://github.com/OriginProtocol/origin/tree/master/infra/discovery/src/listener/queries

  const { event = {}, related = {} } = req.body
  const { returnValues = {} } = event
  const eventName = event.event
  const { listing = {}, offer = {} } = related
  const { seller = {} } = listing
  const buyer = offer ? offer.buyer : {} // Not all events have offers
  const eventDetailsSummary = `eventName=${eventName} blockNumber=${event.blockNumber} logIndex=${event.logIndex}`
  logger.info(`Info: Processing event ${eventDetailsSummary}`)

  // TODO: Temp hack for now that we only test for mobile messages.
  // Thats how the old listener decided if there was a message. Will do
  // now until we get real pipeline built.
  if (!processableEvent(eventName, 'mobile')) {
    logger.info(
      `Info: Not a processable event. Skipping ${eventDetailsSummary}`
    )
    return res.status(200).send({ status: 'ok' })
  }

  let error
  if (!listing) error = 'Missing listing data'
  if (!seller || !seller.id) error = 'Missing seller id'
  if (!buyer || !buyer.id) error = 'Missing buyer id'
  if (!returnValues.party) error = 'Missing party'
  if (error) {
    logger.error(`${error}. Skipping ${eventDetailsSummary}`)
    return res.status(400).send({ errors: [error] })
  }

  // Normalize buyer, seller and party to use owner (aka "wallet") rather than proxy addresses.
  // The reason is that identity and notification data are stored under the owner's address.
  // Note: there is some malformed data on dev and staging causing some identities to
  // fail loading. This is why we have all those defensive checks.
  let party = returnValues.party.toLowerCase()
  const buyerAddress = (
    _.get(buyer, 'identity.owner.id', '') || buyer.id
  ).toLowerCase()
  const sellerAddress = (
    _.get(seller, 'identity.owner.id', '') || seller.id
  ).toLowerCase()
  const buyerProxy = _.get(buyer, 'identity.owner.proxy.id', '').toLowerCase()
  const sellerProxy = _.get(seller, 'identity.owner.proxy.id', '').toLowerCase()
  if (party === buyerProxy) {
    party = buyerAddress
  } else if (party === sellerProxy) {
    party = sellerAddress
  }

  logger.info(`>eventName: ${eventName}`)
  logger.info(`>party: ${party}`)
  logger.info(`>buyerAddress: ${buyerAddress}`)
  logger.info(`>sellerAddress: ${sellerAddress}`)
  logger.info(`offer:`)
  logger.info(offer)
  logger.info(`listing:`)
  logger.info(listing)

  // Email notifications
  await new EmailSender(config).sendMarketplaceEmail(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing
  )

  // Mobile Push notifications
  await new MobilePush(config).sendMarketplaceNotification(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing
  )

  // Browser push subscripttions
  // browserPush(eventName, party, buyerAddress, sellerAddress, offer)

  res.status(200).send({ status: 'ok' })
})

app.listen(port, () =>
  logger.info(`Notifications server listening at http://localhost:${port}`)
)

module.exports = app
