/**
 * Pull the shop ID from either the authentication (when API key) or from the
 * body of the reqeust, if available.
 */
function getShopId(req) {
  if (!req.user.auth_token) {
    if (req.body && req.body.storeId) {
      return req.body.storeId
    }
    return null
  }
  return req.user.id
}

/**
 * Express middleware to detect and save a store ID for future use or reject if
 * necessary.
 */
function storeGate(req, res, next) {
  const shopId = getShopId(req)
  if (typeof shopId !== 'number') {
    return res.status(status).json({
      success: false,
      message: 'Unknown store'
    })
  }
  req.shopId = shopId
  return next()
}

module.exports = {
  getShopId,
  storeGate
}
