const get = require('lodash/get')

const bodyParser = require('body-parser')
const Stripe = require('stripe')

const { Shop } = require('../models')
const { authShop } = require('./_auth')
const { getConfig } = require('../utils/encryptedConfig')
const makeOffer = require('./_makeOffer')

const rawJson = bodyParser.raw({ type: 'application/json' })

// Stripe CLI for testing webhook:
//    stripe login
//    stripe listen --forward-to localhost:3000/webhook
// Update stripe webhook in shop server config

module.exports = function(app) {
  app.post('/pay', authShop, async (req, res) => {
    if (req.body.amount < 50) {
      return res.status(400).send({
        success: false,
        message: 'Amount too low for credit card payment'
      })
    }

    const shopConfig = getConfig(req.shop.config)
    if (!shopConfig.web3Pk || !shopConfig.stripeBackend) {
      return res.status(400).send({
        success: false,
        message: 'CC payments unavailable'
      })
    }

    console.log('Trying to make payment...')
    const stripe = Stripe(shopConfig.stripeBackend)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      statement_descriptor: req.shop.name,
      metadata: {
        shopId: req.shop.id,
        shopStr: req.shop.authToken,
        listingId: req.shop.listingId,
        encryptedData: req.body.data
      }
    })

    res.send({ success: true, client_secret: paymentIntent.client_secret })
  })

  async function handleWebhook(req, res, next) {
    try {
      const json = JSON.parse(req.body.toString())
      const id = get(json, 'data.object.metadata.shopId')
      req.shop = await Shop.findOne({ where: { id } })
    } catch (err) {
      console.error('Error parsing body: ', err)
      return res.sendStatus(400)
    }

    if (!req.shop) {
      console.debug('Missing shopId from /webhook request')
      return res.sendStatus(400)
    }

    const shopConfig = getConfig(req.shop.config)
    const stripe = Stripe(shopConfig.stripeBackend)

    let event
    const sig = req.headers['stripe-signature']
    try {
      const secret = shopConfig.stripeWebhookSecret
      event = stripe.webhooks.constructEvent(req.body, sig, secret)
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

    req.body.data = get(event, 'data.object.metadata.encryptedData')
    req.amount = get(event, 'data.object.amount')

    next()
  }

  app.post('/webhook', rawJson, handleWebhook, makeOffer)
}
