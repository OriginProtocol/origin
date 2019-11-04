'use strict'

const Web3Utils = require('web3-utils')

const Eth = require('web3-eth')
const Web3Eth = new Eth()

const stringify = require('json-stable-stringify')

const logger = require('../logger')

/**
 * Verifies the sign of message
 *
 * @param {String} address ETH address of the signer
 * @param {String} signature The actual signature
 * @param {Object} payload The data that was signed
 * @returns {Boolean} `true` if `signature` is signed by `address`
 *                    on `payload` in the last 15 minutes;
 *                    `false` otherwise
 */
const verifySign = ({ address, signature, payload }) => {
  try {
    const now = Date.now()
    const signExpLimit =
      (parseInt(process.env.SIGN_EXPIRES_IN) || 15) * 1000 * 60
    const minTimestamp = now - signExpLimit

    if (payload.timestamp < minTimestamp || payload.timestamp > now) {
      // Disallow generation of auth token if
      // sign is older than `SIGN_EXPIRES_IN` minutes OR
      // payload contains a future timestamp
      logger.debug('Invalid timestamp on sign', address, payload, signature)
      return false
    }

    // Get the signer from sign data
    const recoveredAddress = Web3Eth.accounts.recover(
      stringify(payload),
      signature
    )

    // Compare it
    return recoveredAddress === Web3Utils.toChecksumAddress(address)
  } catch (err) {
    logger.error('Failed to verify signature', err)
  }

  return false
}

module.exports = verifySign
