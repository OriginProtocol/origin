const logger = require('../logger')

const webhookAuthMiddleware = (req, res, next) => {
  if (req.headers.authorization !== process.env.WEBHOOK_ADMIN_SECRET) {
    res.status(401).send({
      error: 'Authentication required'
    })
    logger.error(
      'Trying to access webhook internal methods without authorization'
    )
    return
  }

  next()
}

module.exports = webhookAuthMiddleware
