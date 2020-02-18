const Web3 = require('web3')

const { GrowthEvent } = require('@origin/growth-shared/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-shared/src/enums')

const logger = require('../logger')

/**
 * Endpoint for logging entries in the growth_event table.
 * For now we only support logging events of the BrowserExtensionInstalled type.
 * Expected paramaters:
 *  - type: "BrowserExtensionInstalled"
 *  - eth_address: eth address the user used when signing up for origin rewwards.
 *  - uid: unique browser extension id
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function logEvent(req, res) {
  // Check presence and validity of the type parameter.
  const type = req.query.type
  if (type !== 'BrowserExtensionInstalled') {
    return res.status(400).end('Invalid event type')
  }

  // Check presence and validity of the eth_address parameter.
  const ethAddress = req.query.eth_address
  if (!ethAddress) {
    return res.status(400).end('Missing eth_address')
  }
  if (!Web3.utils.isAddress(ethAddress)) {
    return res.status(400).end('Invalid eth_address')
  }

  // Check presence and validity of the uid parameter
  // TODO(franck): check validity of the uid.
  const uid = req.query.uid
  if (!uid) {
    return res.status(400).end('Missing uid')
  }

  const now = new Date()
  await GrowthEvent.insert(
    logger,
    1,
    ethAddress,
    GrowthEventTypes.BrowserExtensionInstalled,
    uid,
    null, // TODO: consider logging the UserAgent. Could be useful for fraud detection.
    now
  )

  return res.send()
}

module.exports = { logEvent }
