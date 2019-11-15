require('dotenv').config()
const config = require('./config')()

const express = require('express')
const cors = require('cors')
const app = express()
const basicAuth = require('express-basic-auth')
const get = require('lodash/get')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_BACKEND)
const Web3 = require('web3')
const { post, getBytes32FromIpfsHash } = require('./_ipfs')
const { Orders } = require('./data/db')

const abi = require('./_abi')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

const web3 = new Web3(config.provider)
const account = web3.eth.accounts.wallet.add(process.env.WEB3_PK)
const ListingId = process.env.LISTING_ID
const Marketplace = new web3.eth.Contract(abi, config.marketplace)

app.use(cors({ origin: true, credentials: true }))

app.get('/', (req, res) => {
  res.send('')
})

const auth = basicAuth({ users: { admin: process.env.ADMIN_PW } })

app.get('/auth', auth, (req, res) => {
  res.json({ success: true })
})

app.get('/orders', auth, async (req, res) => {
  const orders = await Orders.findAll()
  res.json(orders)
})

app.get('/orders/:id', auth, async (req, res) => {
  const order = await Orders.findOne({ where: { order_id: req.params.id } })
  res.json(order)
})

app.post('/pay', bodyParser.json(), async (req, res) => {
  console.log('Trying to make payment...')
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: 'usd',
    metadata: {
      encryptedData: req.body.data
    }
  })

  // console.log(paymentIntent)

  res.send({ success: true, client_secret: paymentIntent.client_secret })
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const rawJson = bodyParser.raw({ type: 'application/json' })

// stripe listen --forward-to localhost:3000/webhook
// STRIPE_WEBHOOK_SECRET=xxx node backend/payment.js
// stripe trigger payment_intent.created

app.post('/webhook', rawJson, async (req, res) => {
  let event
  try {
    const signature = req.headers['stripe-signature']
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
  } catch (err) {
    console.log(`⚠️  Webhook signature verification failed.`)
    return res.sendStatus(400)
  }

  console.log(JSON.stringify(event, null, 4))

  if (event.type === 'payment_intent.succeeded') {
    const encryptedData = get(event, 'data.object.metadata.encryptedData')

    const offer = {
      schemaId: 'https://schema.originprotocol.com/offer_2.0.0.json',
      listingId: ListingId,
      listingType: 'unit',
      unitsPurchased: 1,
      totalPrice: {
        amount: get(event, 'data.object.amount') / 100,
        currency: 'fiat-USD'
      },
      commission: { currency: 'OGN', amount: '0' },
      finalizes: 1209600,
      encryptedData
    }

    const res = await post(config.ipfsApi, offer, true)

    Marketplace.methods
      .makeOffer(
        '0',
        getBytes32FromIpfsHash(res),
        offer.finalizes,
        config.affiliate || ZeroAddress,
        '0',
        '0',
        ZeroAddress,
        config.arbitrator || account.address
      )
      .send({
        from: account.address,
        gas: 350000
      })
      .then(tx => {
        console.log('Make offer:')
        console.log(tx)
      })
      .catch(err => {
        console.log(err)
      })
  }

  res.sendStatus(200)
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`\nListening on port ${PORT}\n`)
})
