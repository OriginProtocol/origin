const logger = require('./logger')

class IdentityEventHandler {
  constructor(config) {
    this.config = config
  }

  /**
   * Main entry point for the proxy event handler.
   * @param {Object} block
   * @param {Object} event
   * @returns {Promise<null>}
   */
  async process(block, event) {
    if (!this.config.proxy) {
      return null
    }
    logger.info('Processing proxy event', block, event)

    // TODO: store mapping wallet -> proxy in the DB

    return null
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
