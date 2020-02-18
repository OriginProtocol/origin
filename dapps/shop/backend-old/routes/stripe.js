const config = require('../config')
const get = require('lodash/get')
const { post, getBytes32FromIpfsHash } = require('../utils/_ipfs')

const Web3 = require('web3')
const bodyParser = require('body-parser')
const stripe = require('stripe')(process.env.STRIPE_BACKEND || '')

const abi = require('../utils/_abi')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

// TODO: This needs to be cleaner, all of this conf does
const web3 = new Web3(process.env.PROVIDER)
const PK = process.env.WEB3_PK
let walletAddress
if (PK) {
  const account = web3.eth.accounts.wallet.add(PK)
  walletAddress = account.address
  console.log(`using walletAddress ${walletAddress}`)
} else {
  throw new Error('WEB3_PK must be defined')
}

const localContract = process.env.MARKETPLACE_CONTRACT
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
const rawJson = bodyParser.raw({ type: 'application/json' })

module.exports = function(app) {
  app.post('/pay', bodyParser.json(), async (req, res) => {
    console.log('Trying to make payment...')
    const paymentIntent = await stripe.paymentIntents.create({
      amount: req.body.amount,
      currency: 'usd',
      metadata: {
        encryptedData: req.body.data,
        listingId: req.body.listingId
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
    const siteConfig = await config.getSiteConfig()
    if (!process.env.PROVIDER && siteConfig.provider) {
      web3.setProvider(siteConfig.provider)
    }

    let event
    try {
      const signature = req.headers['stripe-signature']
      event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret)
    } catch (err) {
      console.log(`⚠️  Webhook signature verification failed.`)
      return res.sendStatus(400)
    }

    if (event.type !== 'payment_intent.succeeded') {
      console.log(`Ignoring event ${event.type}`)
      return res.sendStatus(200)
    }

    const { listingId } = siteConfig
    const givenListingId = get(event, 'data.object.metadata.listingId')
    if (givenListingId !== listingId) {
      console.log(`Incorrect listing: ${givenListingId} != ${listingId}`)
      return res.sendStatus(200)
    }

    console.log(JSON.stringify(event, null, 4))

    const encryptedData = get(event, 'data.object.metadata.encryptedData')
    const contractAddr = siteConfig.marketplaceContract || localContract

    const offerJson = {
      schemaId: 'https://schema.originprotocol.com/offer_2.0.0.json',
      listingId: siteConfig.listingId,
      listingType: 'unit',
      unitsPurchased: 1,
      totalPrice: {
        amount: get(event, 'data.object.amount') / 100,
        currency: 'fiat-USD'
      },
      commission: { currency: 'OGN', amount: '0' },
      finalizes: 60 * 60 * 24 * 14, // 2 weeks after offer accepted
      encryptedData
    }

    let ipfsHash
    try {
      ipfsHash = await post(siteConfig.ipfsApi, offerJson, true)
    } catch (err) {
      console.error(`Error adding offer to ${siteConfig.ipfsApi}!`)
      return res.sendStatus(200)
    }

    const onlyListingId = listingId.split('-')[2]
    const Marketplace = new web3.eth.Contract(abi, contractAddr)

    Marketplace.methods
      .makeOffer(
        onlyListingId,
        getBytes32FromIpfsHash(ipfsHash),
        offerJson.finalizes,
        siteConfig.affiliate || ZeroAddress,
        '0',
        '0',
        ZeroAddress,
        siteConfig.arbitrator || walletAddress
      )
      .send({
        from: walletAddress,
        gas: 350000
      })
      .then(tx => {
        console.log('Make offer:')
        console.log(tx)
      })
      .catch(err => {
        console.log(err)
      })

    res.sendStatus(200)
  })
}
