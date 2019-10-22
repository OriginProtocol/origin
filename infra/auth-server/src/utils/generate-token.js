'use strict'

// const Web3Utils = require('web3-utils')

// const { Sequelize, AuthToken } = require('../models')

const jwt = require('jsonwebtoken')

const pick = require('lodash/pick')

/**
 *
 * @param {String} params.address ETH Address of the signer
 * @param {String} params.signature Sign of `address` on `payload`
 * @param {Object} params.payload the payload that was signed
 * @retuns <String>authToken if successful; null otherwise
 */
const generateToken = params => {
  try {
    const tokenParams = pick(params, ['address', 'signature', 'payload'])

    const authToken = jwt.sign(tokenParams, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE_IN || '30 days'
    })

    // TODO: Log access

    return authToken
  } catch (err) {
    logger.error('Failed to generate token', params, err)
  }

  return null
}

module.exports = generateToken
