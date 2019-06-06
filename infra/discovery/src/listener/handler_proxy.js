const esmImport = require('esm')(module)
const contracts = esmImport('@origin/graphql/src/contracts').default

const db = require('../models')

const logger = require('./logger')

class IdentityEventHandler {
  constructor(config) {
    this.config = config
  }

  /**
   * Main entry point for the proxy event handler.
   * @param block
   * @param event
   * @returns {Promise<*>}
   */
  async process(block, event) {
    if (!this.config.proxy) {
      return null
    }
    if (event.event !== 'ProxyCreation') {
      throw new Error(`Unexpected event ${event.event}`)
    }

    // Get the address of the newly created proxy from the event.
    const proxyAddress = event.returnValues.proxy
    if (!proxyAddress || contracts.web3.utils.toBN(proxyAddress).isZero()) {
      throw new Error(
        `Invalid proxy address in ProxyCreation event: ${proxyAddress}`
      )
    }
    logger.info(`Processing ProxyCreation event. Proxy address=${proxyAddress}`)

    // Call the proxy contract to get the address of its owner.
    const Proxy = contracts.ProxyImp.clone()
    Proxy.options.address = proxyAddress
    const ownerAddress = await Proxy.methods.owner().call()
    logger.info(`Proxy owner=${ownerAddress}`)

    // Persist the data in the DB
    const data = {
      address: proxyAddress.toLowerCase(),
      ownerAddress: ownerAddress.toLowerCase()
    }
    await db.Proxy.upsert(data)
    return { proxyAddress, ownerAddress }
  }

  // Disable all webooks.
  webhookEnabled() {
    return false
  }

  discordWebhookEnabled() {
    return false
  }

  emailWebhookEnabled() {
    return false
  }

  gcloudPubsubEnabled() {
    return false
  }
}

module.exports = IdentityEventHandler
