const { Shops } = require('../data/db')

/**
 * Pull the shop ID from either the authentication (when API key) or from the
 * body of the request, if available.
 */
async function getShopId(req) {
  if (!req.user.auth_token) {
    if (req.body && req.body.shopId) {
      return req.body.shopId
    } else {
      if (req.user) {
        try {
          const token = req.headers.authorization.split(' ')[1]
          const shop = await Shops.findOne({
            where: {
              auth_token: token
            }
          })
          return shop.id
        } catch (e) {
          /* noop */
        }
      }
    }
    return null
  }
  return req.user.id
}

/**
 * Express middleware to detect and save a shop ID for future use or reject if
 * necessary.
 */
async function shopGate(req, res, next) {
  const shopId = await getShopId(req)
  if (typeof shopId !== 'number') {
    return res.status(400).json({
      success: false,
      message: 'Unknown store'
    })
  }
  req.shopId = shopId
  return next()
}

module.exports = {
  getShopId,
  shopGate
}
