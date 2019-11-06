'use strict'

const crypto = require('crypto')

const logger = require('../logger')

/**
 * Encrypts the payload using private key
 *
 * @param {String} payload
 * @returns {String} Encrypted hex string
 */
const encryptPayload = payload => {
  const privateKey = process.env.AUTH_PRIV_KEY

  if (!privateKey) {
    throw new Error('AUTH_PRIV_KEY not set')
  }

  try {
    return crypto
      .privateEncrypt(privateKey, Buffer.from(payload))
      .toString('hex')
  } catch (err) {
    logger.error('Failed to encrypt payload', payload, err)
    throw new Error('Failed to generate auth token')
  }
}

/**
 * Decrypts the payload using public key
 *
 * @param {String} payload Encrypted hex string
 * @returns {String} Decrypted payload
 */
const decryptPayload = payload => {
  const publicKey = process.env.AUTH_PUB_KEY

  if (!publicKey) {
    throw new Error('AUTH_PUB_KEY not set')
  }

  try {
    return crypto
      .publicDecrypt(publicKey, Buffer.from(payload, 'hex'))
      .toString('utf8')
  } catch (err) {
    logger.error('Failed to decrypt payload', payload, err)
    throw new Error('Failed to verify token')
  }
}

module.exports = {
  encryptPayload,
  decryptPayload
}
