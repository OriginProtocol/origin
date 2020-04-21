const get = require('lodash/get')

const bodyParser = require('body-parser')
const Stripe = require('stripe')

const { Shop } = require('../models')
const { authShop } = require('./_auth')
const encConf = require('../utils/encryptedConfig')
const { WEB3_PK } = require('../utils/const')
const { makeOffer } = require('../utils/orders')

const rawJson = bodyParser.raw({ type: 'application/json' })

module.exports = function(app) {
  app.post('/pay', authShop, async (req, res) => {
    if (!WEB3_PK) {
      return res.status(400).send({
        success: false,
        message: 'CC payments unavailable'
      })
    }
    const shopId = req.shop.id

    if (req.body.amount < 50) {
      return res.status(400).send({
        success: false,
        message: 'Amount too low for credit card payment'
      })
    }

    // Get API Key from config, and init Stripe
    const stripeBackend = await encConf.get(shopId, 'stripeBackend')
    if (!stripeBackend) {
      return res.status(400).send({
        success: false,
        message: 'CC payments unavailable'
      })
    }
    const stripe = Stripe(stripeBackend || '')

    console.log('Trying to make payment...')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      statement_descriptor: req.shop.name,
      metadata: {
        shopId,
        listingId: req.shop.listingId,
        encryptedData: req.body.data
      }
    })

    // console.log(paymentIntent)

    res.send({ success: true, client_secret: paymentIntent.client_secret })
  })

  // Stripe CLI for testing webhook:
  //    stripe listen --forward-to localhost:3000/webhook
  //    STRIPE_WEBHOOK_SECRET=xxx node backend/payment.js
  //    stripe trigger payment_intent.succeeded

  app.post('/webhook', rawJson, async (req, res) => {
    if (!WEB3_PK) {
      return res.sendStatus(400)
    }

    let jasonBody, shopId, shop
    try {
      jasonBody = JSON.parse(req.body.toString())
      shopId = get(jasonBody, 'data.object.metadata.shopId')
      shop = await Shop.findOne({ where: { id: shopId } })
      if (shop) {
        shopId = shop.id
      }
    } catch (err) {
      console.error('Error parsing body: ', err)
      return res.sendStatus(400)
    }

    // TODO: use a validator instead
    if (!shopId) {
      console.debug('Missing shopId from /webhook request')
      return res.sendStatus(400)
    }

    // Get API Key from config, and init Stripe
    const stripeBackend = await encConf.get(shopId, 'stripeBackend')
    const stripe = Stripe(stripeBackend || '')
    const webhookSecret = await encConf.get(shopId, 'stripeWebhookSecret')

    let event
    const signature = req.headers['stripe-signature']
    try {
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`)
      console.error(err)
      return res.sendStatus(400)
    }

    if (event.type !== 'payment_intent.succeeded') {
      console.log(`Ignoring event ${event.type}`)
      return res.sendStatus(200)
    }

    console.log(JSON.stringify(event, null, 4))

    const encryptedData = get(event, 'data.object.metadata.encryptedData')
    const amount = get(event, 'data.object.amount') / 100

    makeOffer({ shop, amount, encryptedData })
      .then(() => res.sendStatus(200))
      .catch(err => {
        console.error(err)
        res.status(500)
        return
      })
  })
}
