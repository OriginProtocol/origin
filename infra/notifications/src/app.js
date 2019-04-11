require('dotenv').config()

// TODO: Debugging line for auto-reload
// console.log('\033[2J')
// console.log(
//   '─────────────────────────────────────────────────────────────────────────────────'
// )

try {
  require('envkey')
} catch (error) {
  console.error('EnvKey not configured. Please set env var ENVKEY')
}

const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const { RateLimiterMemory } = require('rate-limiter-flexible')

const { mobilePush } = require('./mobilePush')
const { browserPush } = require('./browserPush')
const { emailSend } = require('./emailSend')

const app = express()
const port = 3456
const emailAddress = process.env.VAPID_EMAIL_ADDRESS
let privateKey = process.env.VAPID_PRIVATE_KEY
let publicKey = process.env.VAPID_PUBLIC_KEY

if (!privateKey || !publicKey) {
  console.warn(
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

const config = {
  // Override email. All emails will be sent to this address, regardless of
  // actual intended email address.
  overrideEmail: args['--override-email'] || process.env.OVERRIDE_EMAIL || null,
  // Email account from whom emails will be sent
  fromEmail: args['--fromEmail'] || process.env.SENDGRID_FROM_EMAIL,
  // SendGrid ASM Group ID. Used for unsubscribing.
  asmGroupId: args['--asm-group-id'] || process.env.ASM_GROUP_ID || 9092
}

console.log(config)

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

// limit request to one per minute
const rateLimiterOptions = {
  points: 1,
  duration: 60
}
const rateLimiter = new RateLimiterMemory(rateLimiterOptions)
// use rate limiter on all root path methods
app.all((req, res, next) => {
  rateLimiter
    .consume(req.connection.remoteAddress)
    .then(() => {
      next()
    })
    .catch(() => {
      res.status(429).send('<h1>Too Many Requests</h1>')
    })
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
    if (app.get('env') === 'development') {
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
  const buyer = offer ? offer.buyer : null // Not all events have offers
  const eventDetailsSummary = `eventName=${eventName} blockNumber=${
    event.blockNumber
  } logIndex=${event.logIndex}`

  // TODO: Temp hack for now that we only test for mobile messages.
  // Thats how the old listener decided if there was a message. Will do
  // now until we get real pipeline built.
  if (!processableEvent(eventName, 'mobile')) {
    console.info(
      `Info: Not a processable event. Skipping ${eventDetailsSummary}`
    )
    return
  }

  if (!listing) {
    console.error(
      `Error: Missing listing data. Skipping ${eventDetailsSummary}`
    )
    return
  }
  if (!seller.id) {
    console.error(`Error: Missing seller.id. Skipping ${eventDetailsSummary}`)
    return
  }
  if (!buyer.id) {
    console.error(`Error: Missing buyer.id. Skipping ${eventDetailsSummary}`)
    return
  }

  // ETH address of the party who initiated the action.
  // Could be the seller, buyer or a 3rd party (ex: arbitrator, affiliate, etc...).
  if (!returnValues.party) {
    console.error(`Error: Invalid part, skipping ${eventDetailsSummary}`)
    return
  }

  const party = returnValues.party.toLowerCase()
  const buyerAddress = buyer.id ? buyer.id.toLowerCase() : null
  const sellerAddress = seller.id ? seller.id.toLowerCase() : null

  console.info(`Info: Processing event ${eventDetailsSummary}`)

  console.log('party:')
  console.log(party)
  console.log('buyerAddress:')
  console.log(buyerAddress)
  console.log('sellerAddress:')
  console.log(sellerAddress)

  // Return 200 to the event-listener without waiting for processing of the event.
  res.status(200).send({ status: 'ok' })

  // Mobile Push (linker) notifications
  mobilePush(eventName, party, buyerAddress, sellerAddress, offer)

  // Browser push subscripttions
  browserPush(eventName, party, buyerAddress, sellerAddress, offer)

  // Email notifications
  emailSend(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing,
    config
  )
})

app.listen(port, () => console.log(`Notifications server listening at ${port}`))
