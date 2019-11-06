'use strict'

const pick = require('lodash/pick')
const stringify = require('json-stable-stringify')

const Web3Utils = require('web3-utils')

const logger = require('../logger')

const { encryptPayload } = require('../helpers')

/**
 * Generate a auth token that is valid for 30 days
 *
 * @param {String} params.address ETH Address of the signer
 * @returns {{
 *  authToken: String,
 *  expiresAt: Number,
 *  issuedAt: Number
 * }}
 */
const generateToken = params => {
  const tokenPayload = pick(params, ['address'])

  if (!tokenPayload.address) {
    throw new Error('`address` field is required')
  }

  if (!Web3Utils.isAddress(tokenPayload.address)) {
    throw new Error('`address` should be a valid Ethereum address')
  }

  const tokenValidDays = parseInt(process.env.TOKEN_EXPIRES_IN) || 30

  const issuedAt = Date.now()
  const expiresAt = issuedAt + tokenValidDays * 24 * 60 * 60 * 1000

  // Add some timestamps to the payload
  tokenPayload.issuedAt = issuedAt
  tokenPayload.expiresAt = expiresAt

  const authToken = encryptPayload(stringify(tokenPayload))

  logger.debug(
    `Generated auth token for ${tokenPayload.address} at ${issuedAt}`
  )

  return {
    authToken,
    // Client applications need these timestamp
    // So send them along with the token
    expiresAt,
    issuedAt
  }
}

module.exports = generateToken
