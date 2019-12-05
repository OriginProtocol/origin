require('dotenv').config()
const config = require('../config')()
const get = require('lodash/get')
const { post, getBytes32FromIpfsHash } = require('../utils/_ipfs')

const Web3 = require('web3')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_BACKEND)

const abi = require('../utils/_abi')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

const web3 = new Web3(config.provider)
const account = web3.eth.accounts.wallet.add(process.env.WEB3_PK)
const ListingId = process.env.LISTING_ID
const Marketplace = new web3.eth.Contract(abi, config.marketplace)

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const rawJson = bodyParser.raw({ type: 'application/json' })

module.exports = function(app) {
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
      const listingId = ListingId.split('-')[2]

      Marketplace.methods
        .makeOffer(
          listingId,
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
}
