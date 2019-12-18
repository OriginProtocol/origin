'use strict'

const validateToken = require('../utils/validate-token')

const authMiddleware = async (req, res, next) => {
  const { success, errors, authData } = await validateToken(req)

  if (!success) {
    return res.status(401).send({ errors })
  }

  // Pass down the data if it is needed for the other services
  req.__originAuth = authData

  next()
}

module.exports = authMiddleware
