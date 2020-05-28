const { makeOfferQueue } = require('../queues/queues')

/**
 * req.shop
 * req.amount amount in cents
 * req.body.data encrypted IPFS data hash
 */
async function makeOffer(req, res) {
  const shop = req.shop
  const amount = req.amount
  const encryptedData = req.body.data

  await makeOfferQueue.add(
    {
      shopId: shop.id,
      amount: amount,
      encryptedData: encryptedData
    },
    { attempts: 6 }
  ) // Allow up to six attempts

  res.sendStatus(200)
}

module.exports = makeOffer
