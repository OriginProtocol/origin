require('dotenv').config()

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

app.use(bodyParser.json())

// currently showing all subscriptions in an unauthenticated index view - maybe not a good idea in production?
app.get('/', async (req, res) => {
  const subs = await PushSubscription.findAll()

  res.send(`<h1>${subs.length} Push Subscriptions</h1><ul>${subs.map(s => `<li><pre style="white-space: pre-wrap;word-break: break-all">${JSON.stringify(s)}</pre></li>`)}</ul>`)
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
  const { log, related } = req.body
  const { buyer = {}, listing, offer, seller = {} } = related

  res.sendStatus(200)

  if (!listing || (!buyer.address && !seller.address)) {
    return
  }

  const subs = await PushSubscription.findAll({
    where: {
      account: {
        [Sequelize.Op.in]: [buyer.address, seller.address].filter(a => a)
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
        title: log.eventName,
        body: listing.title,
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
