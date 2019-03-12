const Web3 = require('web3')
const logger = require('./logger')

const _bridgeModels = require('origin-bridge/src/models')
const _discoveryModels = require('../models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._bridgeModels, ..._discoveryModels, ..._identityModels }

const { GrowthEventTypes } = require('origin-growth/src/enums')
const {
  AttestationServiceToEventType,
  GrowthEvent
} = require('origin-growth/src/resources/event')

class IdentityEventHandler {
  constructor(config, origin) {
    this.config = config
    this.origin = origin
  }

  /**
   * Loads attestation data such as email, phone, etc... from the attestation table.
   * @param {string} ethAddress
   * @param {string} method - 'EMAIL', 'PHONE', etc...
   * @returns {Promise<string|null>}
   * @private
   */
  async _loadValueFromAttestation(ethAddress, method) {
    // Loads the most recent value.
    const attestation = db.Attestation.findOne({
      where: {
        ethAddress: ethAddress.toLowerCase(),
        method
      },
      order: [['id', 'DESC']],
      limit: 1
    })
    return attestation ? attestation.value : null
  }

  /**
   * Decorates a user object with attestation data.
   * @param {models.User} user - Origin js user model object.
   * @returns {Promise<void>}
   * @private
   */
  async _decorateUser(user) {
    await Promise.all(
      user.attestations.map(async attestation => {
        switch (attestation.service) {
          case 'email':
            user.email = await this._loadValueFromAttestation(
              user.address,
              'EMAIL'
            )
            break
          case 'phone':
            user.phone = await this._loadValueFromAttestation(
              user.address,
              'PHONE'
            )
            break
          case 'twitter':
            user.twitter = await this._loadValueFromAttestation(
              user.address,
              'TWITTER'
            )
            break
          case 'airbnb':
            user.airbnb = await this._loadValueFromAttestation(
              user.address,
              'AIRBNB'
            )
            break
          case 'facebook':
            // Note: we don't have access to the user's fbook id,
            // only whether the account was verified or not.
            user.facebookVerified = true
            break
        }
      })
    )
  }

  /**
   * Indexes a user in the DB.
   * @param {models.User} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _indexIdentity(user, blockInfo) {
    logger.info(`Indexing identity ${user.address} in DB.`)

    // Check input.
    const ethAddress = user.address
    if (!Web3.utils.isAddress(ethAddress)) {
      throw new Error(`Invalid eth address ${ethAddress}`)
    }

    // Construct an identity object based on the user's profile
    // and data loaded from the attestation table.
    const identity = {
      ethAddress: ethAddress.toLowerCase(),
      firstName: user.profile.firstName,
      lastName: user.profile.lastName,
      email: user.email,
      phone: user.phone,
      airbnb: user.airbnb,
      twitter: user.twitter,
      facebookVerified: user.facebookVerified || false,
      data: { blockInfo }
    }

    logger.debug('Identity=', identity)
    await db.Identity.upsert(identity)
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
    const validProfile =
      (profile.firstName.length > 0 || profile.lastName.length > 0) &&
      profile.avatar.length > 0
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
    await Promise.all(
      user.attestations.map(attestation => {
        const eventType = AttestationServiceToEventType[attestation.service]
        if (!eventType) {
          logger.error(
            `Unrecognized attestation service received: ${
              attestation.service
            }. Skipping.`
          )
          return
        }

        return GrowthEvent.insert(logger, user.address, eventType, null, {
          blockInfo
        })
      })
    )
  }

  /**
   * Main entry point for the identity event handler.
   * @param {Object} log
   * @returns {Promise<{user: User}>}
   */
  async process(log) {
    if (!this.config.identity) {
      return null
    }

    const account = log.decoded.account
    logger.info(`Processing Identity event for account ${account}`)

    const user = await this.origin.users.get(account)
    if (!user) {
      logger.error(
        `Failed loading identity data for account ${account} - skipping indexing`
      )
      return
    }
    // Avatar can be large binary data. Clip it for logging purposes.
    if (user.profile.avatar) {
      user.profile.avatar = user.profile.avatar.slice(0, 32) + '...'
    }

    // Decorate the user object with extra attestation related info.
    await this._decorateUser(user)

    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }

    await this._indexIdentity(user, blockInfo)

    if (this.config.growth) {
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

  // Call the webhook to add the user's email to Origin's mailing list.
  emailWebhookEnabled() {
    return true
  }

  gcloudPubsubEnabled() {
    return false
  }
}

module.exports = IdentityEventHandler
