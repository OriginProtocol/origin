const Web3 = require('web3')

const { GrowthEvent } = require('@origin/growth-shared/src/resources/event')
const { GrowthEventTypes } = require('@origin/growth-shared/src/enums')

const logger = require('../logger')

/**
 * Endpoint for logging entries in the growth_event table.
 * For now we only support logging events of the BrowserExtensionInstalled type.
 * Expected params:
 *  - type: "BrowserExtensionInstalled"
 *  - eth_address: eth address the user used when signing up for origin rewwards.
 *  - uid: unique browser extension id
 * @param req
 * @param res
 * @returns {Promise<*>}
 */
async function logEvent(req, res) {
  // Check presence and validity of the type parameter.
  const type = req.body.type
  if (type !== 'BrowserExtensionInstalled') {
    return res.status(400).end('Invalid event type')
  }

  // Check presence and validity of the eth_address parameter.
  const ethAddress = req.body.eth_address
  if (!ethAddress) {
    return res.status(400).end('Missing eth_address')
  }
  if (!Web3.utils.isAddress(ethAddress)) {
    return res.status(400).end('Invalid eth_address')
  }

  // Check presence and validity of the uid parameter
  const installId = req.body.install_id
  if (!installId) {
    return res.status(400).end('Missing installId')
  }

  // Check presence and validity of the fingerprint parameter.
  const fingerprint = req.body.fingerprint
  if (!fingerprint) {
    return res.status(400).end('Missing fingerprint')
  }

  const ip = req.connection.remoteAddress

  const now = new Date()
  await GrowthEvent.insert(
    logger,
    1,
    ethAddress,
    GrowthEventTypes.BrowserExtensionInstalled,
    installId,
    { fingerprint, ip },
    now
  )

  return res.send()
}

module.exports = { logEvent }
