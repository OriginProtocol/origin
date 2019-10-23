'use strict'

const { AuthTokenGenerationLog } = require('../models')

const jwt = require('jsonwebtoken')

const pick = require('lodash/pick')

const verifyToken = require('./verify-token')

const logger = require('../logger')

/**
 * Parses the token and logs the information from it to DB
 * @param {String} token Token whose data to log
 * @param {String} ipAddress IP address to log
 */
const logTokenData = async (token, ipAddress) => {
  try {
    // Note: Using `verifyToken` instead of directly passing the param here
    // Otherwise, we would not get the `iat` and `exp` parameters
    const data = await verifyToken(token, true)

    if (!data) {
      throw new Error('Verification failed')
    }

    await AuthTokenGenerationLog.create({
      ethAddress: data.address,
      signature: data.signature,
      data: data.payload,
      issuedAt: data.iat,
      expiresAt: data.exp,
      ipAddress
    })
  } catch (err) {
    logger.error('Failed to log token generation from ', ipAddress, err)
  }
}

/**
 *
 * @param {String} params.address ETH Address of the signer
 * @param {String} params.signature Sign of `address` on `payload`
 * @param {Object} params.payload the payload that was signed
 * @retuns <String>authToken if successful; null otherwise
 */
const generateToken = async params => {
  try {
    const tokenParams = pick(params, ['address', 'signature', 'payload'])

    const authToken = jwt.sign(tokenParams, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_IN || '30 days'
    })

    await logTokenData(authToken, params.ip)

    return authToken
  } catch (err) {
    logger.error('Failed to generate token', params, err)
  }

  return null
}

module.exports = generateToken
