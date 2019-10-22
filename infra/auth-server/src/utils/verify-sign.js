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
 * @returns {Boolean} true if `signature` is signed by `address` on `payload` in the last 30 days; false otherwise
 */
const verifySign = ({ address, signature, payload }) => {
  try {
    // TODO: Should we also check if timestamp > Date.now()?
    const minTimestamp = Date.now() - 1000 * 60 * 60 * 24 * 30
    if (payload.timestamp < minTimestamp) {
      // Disallow generation of auth token if
      // sign is older than 30 days
      logger.debug('Cannot use older sign', address, payload, signature)
      return false
    }

    const recoveredAddress = Web3Eth.accounts.recover(
      stringify(payload),
      signature
    )

    return recoveredAddress === Web3Utils.toChecksumAddress(address)
  } catch (err) {
    logger.error('Failed to verify signature', err)
  }

  return false
}

module.exports = verifySign
