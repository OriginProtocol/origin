const logger = require('../logger')

const pushAppAuth = (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    // Skip on dev
    return next()
  }

  if (req.headers.authorization !== process.env.ADMIN_SECRET) {
    logger.error('Invalid auth secret')
    return res.status(403).send({
      error: 'Invalid auth secret'
    })
  }

  next()
}

module.exports = pushAppAuth
