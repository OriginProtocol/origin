const logger = require('./logger')

const { GrowthEventTypes } = require('origin-growth/src/enums')
const { AttestationServiceToEventType, GrowthEvent } = require('origin-growth/src/resources/event')


class IdentityEventHandler {
  /**
   * Indexes a user in the DB.
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _indexUser(user, blockInfo) {
    // TODO(franck): implement me
    logger.debug(`Indexing user ${user.address} blockInfo ${blockInfo}`)
    return
  }

  /**
   * Records a ProfilePublished event in the growth_event table.
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthProfileEvent(user, blockInfo) {
    // Check profile is populated.
    const profile = user.profile
    const validProfile = (profile.firstName.length > 0 || profile.lastName.length > 0) &&
      (profile.avatar.length > 0)
    if (!validProfile) {
      return
    }

    // Record the event.
    await GrowthEvent.insert(
      logger,
      user.address,
      GrowthEventTypes.ProfilePublished,
      null,
      { blockInfo }
    )

  }

  /**
   * Records AttestationPublished events in the growth_event table.
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthAttestationEvents(user, blockInfo) {
    user.attestations.forEach(async attestation => {
      const eventType = AttestationServiceToEventType[attestation.service]
      if (!eventType) {
        logger.error(`Unrecognized attestation service received: ${attestation.service}. Skipping.`)
        return
      }

      await GrowthEvent.insert(
        logger,
        user.address,
        eventType,
        null,
        { blockInfo }
      )
    })
  }

  /**
   * Main entry point for the identity event handler.
   * @param {Object} log
   * @param {Object} context
   * @returns {Promise<{user: User}>}
   */
  async process(log, context) {
    const account = log.decoded.account
    logger.info(`Processing Identity event for account ${account}`)

    const user = await context.origin.users.get(account)
    if (!user) {
      logger.error(`Failed loading identity data for account ${account} - skipping indexing`)
      return
    }
    // Avatar can be large binary data. Clip it for logging purposes.
    if (user.profile.avatar) {
      user.profile.avatar = user.profile.avatar.slice(0, 32) + '...'
    }

    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }

    if (context.config.db) {
      await this._indexUser(user, blockInfo)
    }

    if (context.config.growth) {
      await this._recordGrowthProfileEvent(user, blockInfo)
      await this._recordGrowthAttestationEvents(user, blockInfo)
    }

    return { user }
  }

  // Do not call the notification webhook for identity events.
  webhookEnabled() {
    return false
  }

  // Do not call discord webhook for identity events.
  discordWebhookEnabled() {
    return false
  }
}

module.exports = IdentityEventHandler