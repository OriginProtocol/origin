const { Shops } = require('../data/db')

async function createShop({ name, listingId, authToken, config, sellerId }) {
  if (!name) {
    return { status: 400, error: 'Provide a shop name' }
  }
  if (!listingId) {
    return { status: 400, error: 'Provide a listing ID' }
  }
  if (!String(listingId).match(/^[0-9]+-[0-9]+-[0-9]+$/)) {
    return {
      status: 400,
      error: 'Listing ID must be of form xxx-xxx-xxx eg 1-001-123'
    }
  }
  if (!authToken) {
    return { status: 400, error: 'Provide an auth token' }
  }
  if (!sellerId) {
    return { status: 400, error: 'Provide a seller ID' }
  }

  const networkId = Number(listingId.split('-')[0])

  const shop = await Shops.create({
    name,
    networkId,
    listingId,
    authToken,
    config,
    sellerId
  })

  return { shop }
}

function findShopByHostname(req, res, next) {
  Shops.findOne({ where: { hostname: req.hostname } }).then(shop => {
    req.shop = shop
    next()
  })
}

module.exports = { createShop, findShopByHostname }
