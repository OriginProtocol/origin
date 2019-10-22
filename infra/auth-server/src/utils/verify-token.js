'use strict'

const jwt = require('jsonwebtoken')
const logger = require('../logger')

const verifyToken = authToken => {
  try {
    // TODO: Check balcklist
    return jwt.verify(authToken, process.env.JWT_SECRET, {
      maxAge: process.env.JWT_EXPIRE_IN || '30 days'
    })
  } catch (err) {
    logger.error('Failed to verify token', err)
  }

  return null
}

module.exports = verifyToken
