const Web3 = require('web3')
const logger = require('./logger')

const _discoveryModels = require('../models')
const _identityModels = require('origin-identity/src/models')
const db = { ..._discoveryModels, ..._identityModels }

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
    // Notes:
    //  - Use a raw query since attestation model not ported yet to JS.
    //  - The attestation table stores eth addresses checksummed.
    const attestations = await db.sequelize.query(
      'SELECT * FROM attestation WHERE eth_address=(:ethAddress) AND method=(:method) ORDER BY ID DESC LIMIT 1',
      {
        replacements: {
          ethAddress: Web3.utils.toChecksumAddress(ethAddress),
          method
        },
        type: db.sequelize.QueryTypes.SELECT
      }
    )
    return attestations.length === 1 ? attestations[0].value : null
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
   * If the user signed up via a referral, links the referrer and referee
   * by inserting a row in the growth_referral table.
   * @param {UserModel} user - Origin-js user model object.
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthReferral(user) {
    if (!user.metadata || !user.metadata.referrerCode) {
      // Nothing to record, the user did not come from referral program.
      return
    }

    const referee = user.address.toLowerCase()

    // Lookup the invite code to get the referrer.
    const code = await db.GrowthInviteCode.findOne({
      where: { code: user.metadata.referrerCode }
    })
    if (!code) {
      logger.error(`Invalid referral code present in identity of ${referee}`)
      return
    }
    const referrer = code.ethAddress

    // Check for any existing referral data for this referee.
    const row = db.GrowthReferral.findOne({
      where: {
        referee_eth_address: referee
      }
    })
    if (row) {
      if (row.referrerEthAddress != referrer) {
        // The referrer present in the referee's identity does not match
        // with the referral data recorded in the DB.
        // A corner case scenario this might happen is as follow:
        //  - referee receives multiple invites.
        //  - referee clicks on an invite, publishes their profile and
        //    an entry is created in growth_referral table.
        //  - referee wipes out their browser local storage or uses a different
        //    browser and clicks on an invite link from a different referrer.
        //  - referrer updates their profile which now contains
        //    different invite code from another referrer.
        logger.error(
          `Referee ${referee} already referred by ${row.referrerEthAddress}`
        )
      }
      // Referral was already recorded. It could be an identity update,
      // or it's possible the listener is reprocessing data.
      return
    }

    // Record the referee/referrer relationship.
    await db.GrowthReferral.create({
      referrer_eth_address: referrer,
      referee_eth_address: referee
    })
    logger.info(`Recorded referral. Referrer: ${referrer} Referee: ${referee}`)
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
      await this._recordGrowthReferral(user)
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
