const db = require('@origin/identity/src/models')
const esmImport = require('esm')(module)
const contracts = esmImport('@origin/graphql/src/contracts').default

const logger = require('./logger')

const ZeroAddress = '0x0000000000000000000000000000000000000000'

class ProxyEventHandler {
  constructor(context) {
    this.config = context.config
  }

  /**
   * Lookup a proxy's owner by making a call to the blockchain.
   * @param proxyAddress
   * @returns {Promise<*>}
   * @private
   */
  async _getProxyOwner(proxyAddress) {
    const Proxy = contracts.ProxyImp.clone()
    Proxy.options.address = proxyAddress
    return Proxy.methods.owner().call()
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
    if (proxyAddress === ZeroAddress) {
      // We had a bug causing some transactions to have a zero proxy address.
      // Skip those...
      logger.warn('ProxyEventHandler: skipping event with zero proxy address.')
      return null
    }
    if (!proxyAddress || !parseInt(proxyAddress, 16)) {
      throw new Error(
        `Invalid proxy address in ProxyCreation event: ${proxyAddress}`
      )
    }
    logger.info(`Processing ProxyCreation event. Proxy address=${proxyAddress}`)

    // Call the proxy contract to get the address of its owner.
    const ownerAddress = await this._getProxyOwner(proxyAddress)
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

module.exports = ProxyEventHandler
