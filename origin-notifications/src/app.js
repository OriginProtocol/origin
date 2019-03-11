require('dotenv').config()
try {
  require('envkey')
} catch (error) {
  console.log('EnvKey not configured')
}

const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const Sequelize = require('sequelize')
const fetch = require('cross-fetch')
const { RateLimiterMemory } = require('rate-limiter-flexible')
const PushSubscription = require('./models').PushSubscription
const { getNotificationMessage, processableEvent } = require('./notification')

const app = express()
const port = 3456
const emailAddress = process.env.VAPID_EMAIL_ADDRESS
let privateKey = process.env.VAPID_PRIVATE_KEY
let publicKey = process.env.VAPID_PUBLIC_KEY
const linkingNotifyEndpoint = process.env.LINKING_NOTIFY_ENDPOINT
const linkingNotifyToken = process.env.LINKING_NOTIFY_TOKEN
const dappOfferUrl = process.env.DAPP_OFFER_URL

if (!privateKey || !publicKey) {
  console.log(
    'Warning: VAPID public or private key not defined, generating one'
  )
  const vapidKeys = webpush.generateVAPIDKeys()
  publicKey = vapidKeys.publicKey
  privateKey = vapidKeys.privateKey
}

webpush.setVapidDetails(`mailto:${emailAddress}`, publicKey, privateKey)

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
  let markup = `<h1>Origin Notifications</h1><h2><a href="https://github.com/OriginProtocol/origin/issues/806">Learn More</a></h2>`

  if (app.get('env') === 'development') {
    const subs = await PushSubscription.findAll()

    markup += `<h3>${subs.length} Push Subscriptions</h3><ul>${subs.map(
      s =>
        `<li><pre style="white-space: pre-wrap;word-break: break-all">${JSON.stringify(
          s
        )}</pre></li>`
    )}</ul>`
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
 */
app.post('/events', async (req, res) => {
  const { log = {}, related = {} } = req.body
  const { decoded = {}, eventName } = log
  const { buyer = {}, listing, offer, seller = {} } = related
  const eventDetails = `eventName=${eventName} blockNumber=${
    log.blockNumber
  } logIndex=${log.logIndex}`

  // Return 200 to the event-listener without
  // waiting for processing of the event.
  res.json({ status: 'ok' })
  //res.sendStatus(200)

  if (!listing || (!seller.address && !buyer.address)) {
    console.log(`Error: Missing data. Skipping ${eventDetails}`)
    return
  }

  // ETH address of the party who initiated the action.
  // Could be the seller, buyer or a 3rd party (ex: arbitrator, affiliate, etc...).
  if (!decoded.party) {
    console.log(`Error: Invalid part, skipping ${eventDetails}`)
    return
  }

  const party = decoded.party.toLowerCase()
  const buyerAddress = buyer.address ? buyer.address.toLowerCase() : null
  const sellerAddress = seller.address ? seller.address.toLowerCase() : null

  if (!processableEvent(eventName)) {
    console.log(`Info: Not a processable event. Skipping ${eventDetails}`)
    return
  }

  console.log(`Info: Processing event ${eventDetails}`)

  if (linkingNotifyEndpoint) {
    const receivers = {}
    const buyerMessage = getNotificationMessage(
      eventName,
      party,
      buyerAddress,
      'buyer'
    )
    const sellerMessage = getNotificationMessage(
      eventName,
      party,
      sellerAddress,
      'seller'
    )
    const eventData = {
      url: offer && path.join(dappOfferUrl, offer.id),
      to_dapp: true
    }

    if (buyerMessage || sellerMessage) {
      if (buyerMessage) {
        receivers[buyerAddress] = Object.assign(
          { msg: buyerMessage },
          eventData
        )
      }
      if (sellerMessage) {
        receivers[sellerAddress] = Object.assign(
          { msg: sellerMessage },
          eventData
        )
      }
      try {
        fetch(linkingNotifyEndpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ receivers, token: linkingNotifyToken })
        })
      } catch (error) {
        console.log('Error notifying linking api ', error)
      }
    }
  }

  // Query the DB to get subscriptions from the seller and/or buyer.
  // Note the filter ensures we do not send notification to the party
  // who initiated the action:
  //  - seller initiated action -> only buyer gets notified.
  //  - buyer initiated action -> only seller gets notified.
  //  - 3rd party initiated action -> both buyer and seller get notified.
  const subs = await PushSubscription.findAll({
    where: {
      account: {
        [Sequelize.Op.in]: [buyerAddress, sellerAddress].filter(
          a => a && a !== party
        )
      }
    }
  })

  // Filter out redundant endpoints before iterating.
  await subs
    .filter((s, i, self) => {
      return self.map(ms => ms.endpoint).indexOf(s.endpoint) === i
    })
    .forEach(async s => {
      try {
        const recipient = s.account
        const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

        const message = getNotificationMessage(
          eventName,
          party,
          recipient,
          recipientRole
        )
        if (!message) {
          return
        }

        // Send the push notification.
        // TODO: Add safeguard against sending duplicate messages since the
        // event-listener only provides at-least-once guarantees and may
        // call this webhook more than once for the same event.
        const pushSubscription = {
          endpoint: s.endpoint,
          keys: s.keys
        }
        const pushPayload = JSON.stringify({
          title: message.title,
          body: message.body,
          account: recipient,
          offerId: offer.id
        })
        await webpush.sendNotification(pushSubscription, pushPayload)
      } catch (e) {
        // Subscription is no longer valid - delete it in the DB.
        if (e.statusCode === 410) {
          s.destroy()
        } else {
          console.log(e)
        }
      }
    })
})

app.listen(port, () =>
  console.log(`Notifications server listening on port ${port}!`)
)
