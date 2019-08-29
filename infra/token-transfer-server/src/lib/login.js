const logger = require('../logger')

/**
 * Middleware to ensure a user is logged in.
 * MUST be called by all routes.
 */
function ensureLoggedIn(req, res, next, skipTwoFA = false) {
  if (!req.user) {
    logger.debug('Authentication failed.')
    res.status(401)
    return res.send('This action requires you to login.')
  }

  if (!skipTwoFA && req.user.otpVerified && !req.session.twoFA) {
    logger.debug('Authentication failed. No 2FA in session.')
    res.status(401)
    return res.send('This action requires 2FA.')
  }

  res.setHeader('X-Authenticated-Email', req.user.email)

  next()
}

module.exports = {
  ensureLoggedIn
}
