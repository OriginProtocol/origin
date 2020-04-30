const stripeRaw = require('stripe')
require('dotenv').config()
const { Shop, Order } = require('../models')
const encConf = require('../utils/encryptedConfig')

async function validate(dataDir) {
  const shop = await Shop.findOne({ where: { authToken: dataDir } })
  if (!shop) {
    console.log('No shop found')
    return
  }

  const stripeKey = await encConf.get(shop.id, 'stripeBackend')
  if (!stripeKey) {
    console.log('No stripe key')
    return
  }

  const orders = await Order.findAll({ where: { shopId: shop.id }, limit: 500 })
  const encryptedHashes = orders.map(o => o.encryptedIpfsHash).filter(i => i)
  console.log(`Found ${encryptedHashes.length} orders with encrypted hashes`)

  const stripe = stripeRaw(stripeKey)

  let after

  do {
    await new Promise(resolve => {
      const eventArgs = {
        limit: 100,
        type: 'payment_intent.succeeded',
        starting_after: after
      }
      console.log(`Fetching events after ${after}`)

      stripe.events.list(eventArgs, function(err, events) {
        console.log(`Found ${events.data.length} completed Stripe payments`)
        events.data.forEach(item => {
          const { shopId, encryptedData } = item.data.object.metadata
          if (Number(shopId) !== shop.id) {
            /* Ignore */
          } else if (encryptedHashes.indexOf(encryptedData) < 0) {
            console.log(
              `No order with hash ${encryptedData}. Created ${item.created}. Amount ${item.data.object.amount}`
            )
          } else {
            console.log(`Found hash ${encryptedData} OK`)
          }
        })
        after = events.data.length >= 100 ? events.data[99].id : null
        resolve()
      })
    })
  } while (after)
}

const dataDir = process.argv[2]
if (!dataDir) {
  console.log('Usage: node validatePayments [dataDir]')
  process.exit()
}

validate(dataDir)
