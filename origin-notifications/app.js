require('dotenv').config()
require('envkey')

const express = require('express')
const bodyParser = require('body-parser')
const webpush = require('web-push')
const Sequelize = require('sequelize')
const { RateLimiterMemory } = require('rate-limiter-flexible')

const app = express()
const port = 3456

const PushSubscription = require('./src/models').PushSubscription
const emailAddress = process.env.VAPID_EMAIL_ADDRESS
const privateKey = process.env.VAPID_PRIVATE_KEY
const publicKey = process.env.VAPID_PUBLIC_KEY

const eventNotificationMap = {
  OfferCreated: {
    title: 'New Offer',
    body: 'A buyer has made an offer on your listing.'
  },
  OfferWithdrawn: {
    title: 'Offer Withdrawn',
    // does not make sense if offer is rejected by seller
    body: 'An offer on your listing has been withdrawn.'
  },
  OfferAccepted: {
    title: 'Offer Accepted',
    body: 'An offer you made has been accepted.'
  },
  OfferDisputed: {
    title: 'Dispute Initiated',
    body: 'A problem has been reported with your transaction.'
  },
  OfferRuling: {
    title: 'Dispute Resolved',
    body: 'A ruling has been issued on your disputed transaction.'
  },
  OfferFinalized: {
    title: 'Sale Completed',
    body: 'Your transaction has been completed.'
  },
  OfferData: {
    title: 'New Review',
    body: 'A review has been left on your transaction.'
  }
}

webpush.setVapidDetails(
  `mailto:${emailAddress}`,
  publicKey,
  privateKey
)

// should be tightened up for security
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")

  next()
})

// limit request to one per minute
const rateLimiterOptions = {
  points: 1,
  duration: 60,
}
const rateLimiter = new RateLimiterMemory(rateLimiterOptions)
// use rate limiter on all root path methods
app.all((req, res, next) => {
  rateLimiter.consume(req.connection.remoteAddress)
    .then(() => {
      next()
    })
    .catch((err) => {
      res.status(429).send('<h1>Too Many Requests</h1>')
    })
})

// Note: bump up default payload max size since the event-listener posts
// payload that may contain user profile with b64 encoded profile picture.
app.use(bodyParser.json({limit: '10mb'}))

app.get('/', async (req, res) => {
  let markup = `<h1>Origin Notifications</h1><h2><a href="https://github.com/OriginProtocol/origin/issues/806">Learn More</a></h2>`

  if (app.get('env') === 'development') {
    const subs = await PushSubscription.findAll()

    markup += `<h3>${subs.length} Push Subscriptions</h3><ul>${subs.map(s => `<li><pre style="white-space: pre-wrap;word-break: break-all">${JSON.stringify(s)}</pre></li>`)}</ul>`
  }

  res.send(markup)
})

app.post('/', async(req, res) => {
  const { account, endpoint } = req.body
  // cannot upsert because neither is unique
  const existing = await PushSubscription.find({
    where: { account, endpoint }
  })

  if (existing) {
    return res.sendStatus(200)
  }

  await PushSubscription.create(req.body)

  res.sendStatus(201)
})

app.post('/events', async (req, res) => {
  const { log = {}, related = {} } = req.body
  const { decoded = {}, eventName } = log
  const { buyer = {}, listing, offer, seller = {} } = related
  const eventDetails = `eventName=${eventName} blockNumber=${log.blockNumber} logIndex=${log.logIndex}`

  res.sendStatus(200)

  if (!listing || (!buyer.address && !seller.address)) {
    console.log(`Missing listing or buyer/seller address. Skipping ${eventDetails}`)
    return
  }

  if (!eventNotificationMap[eventName]) {
    console.log(`Not a processable event. Skipping ${eventDetails}`)
    return
  }
  const { body, title } = eventNotificationMap[eventName]
  const { party } = decoded

  console.log(`Processing event ${eventDetails}`)

  const subs = await PushSubscription.findAll({
    where: {
      account: {
        // refrain from sending to the party who initiated the transaction
        [Sequelize.Op.in]: [buyer.address, seller.address].filter(a => a && a !== party)
      }
    }
  })

  // filter out redundant endpoints before iterating
  subs.filter((s, i, self) => {
    return self.map(ms => ms.endpoint).indexOf(s.endpoint) === i
  }).forEach(async s => {
    try {
      // should safeguard against duplicates
      await webpush.sendNotification(s, JSON.stringify({
        title,
        body,
        account: s.account,
        offerId: offer.id
      }))
    } catch(e) {
      // subscription is no longer valid
      if (e.statusCode === 410) {
        s.destroy()
      } else {
        console.log(e)
      }
    }
  })
})

app.listen(port, () => console.log(`Notifications server listening on port ${port}!`))
