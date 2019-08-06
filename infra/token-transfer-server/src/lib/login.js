const logger = require('../logger')

/**
 * Middleware to ensure a user is logged in.
 * MUST be called by all routes.
 */
function ensureLoggedIn(req, res, next) {
  if (!req.session.user.id) {
    logger.debug('Authentication failed. No user in session.')
    res.status(401)
    return res.send('This action requires you to login.')
  }

  if (!req.session.twoFA) {
    logger.debug('Authentication failed. No 2FA in session')
    res.status(401)
    return res.send('This action requires 2FA.')
  }
  //
  // User email is verified and user passed 2FA.
  logger.debug('Authentication success')
  res.setHeader('X-Authenticated-Email', req.session.user.email)
  next()
}

/**
 * MIddleware to ensures a user verified their email.
 */
function ensureEmailVerified(req, res, next) {
  if (!req.session.email) {
    logger.debug('Authentication failed. No email in session')
    res.status(401)
    return res.send('This action requires to verify your email first.')
  }
  next()
}

module.exports = {
  ensureLoggedIn,
  ensureEmailVerified
}
