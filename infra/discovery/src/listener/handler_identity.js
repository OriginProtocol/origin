const Web3 = require('web3')
const logger = require('./logger')

const { bytes32ToIpfsHash } = require('./utils')
const db = {
  ...require('@origin/bridge/src/models'),
  ...require('@origin/identity/src/models'),
  ...require('../models')
}
const identityQuery = require('./queries/Identity')

const { GrowthEventTypes } = require('@origin/growth/src/enums')
const {
  AttestationServiceToEventType,
  GrowthEvent
} = require('@origin/growth/src/resources/event')

class IdentityEventHandler {
  constructor(config, graphqlClient) {
    this.config = config
    this.graphqlClient = graphqlClient
  }

  /*
   *
   */
  _getAttestationService(attestation) {
    if (attestation.data.attestation.site) {
      const siteName = attestation.data.attestation.site.siteName
      if (siteName === 'facebook.com') {
        return 'facebook'
      } else if (siteName === 'twitter.com') {
        return 'twitter'
      } else if (siteName === 'airbnb.com') {
        return 'airbnb'
      } else if (siteName === 'google.com') {
        return 'google'
      } else {
        logger.error(`Unexpected siteName for attestation ${attestation}`)
      }
    } else if (attestation.data.attestation.phone) {
      return 'phone'
    } else if (attestation.data.attestation.email) {
      return 'email'
    } else {
      logger.error(`Failed extracting service from attestation ${attestation}`)
    }
  }

  /* Get details about an account from @origin/graphql
   * @param {String} account: eth address of account
   * @returns {Object} result of GraphQL query
   * @private
   */
  async _getIdentityDetails(account) {
    let result
    try {
      result = await this.graphqlClient.query({
        query: identityQuery,
        variables: { id: account }
      })
    } catch (error) {
      logger.error(
        `Failed loading identity data for account ${account} - skipping indexing`
      )
      logger.error(error)
      return null
    }

    return result.data.web3.account.identity
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
    const attestation = await db.Attestation.findOne({
      where: {
        ethAddress: ethAddress.toLowerCase(),
        method
      },
      order: [['id', 'DESC']],
      limit: 1
    })
    if (!attestation) {
      logger.warn(`Could not find ${method} attestation for ${ethAddress}`)
      return null
    }
    return attestation.value
  }

  /**
   * Decorates an identity object with attestation data.
   * @param {{}} identity - result of identityQuery
   * @returns {Promise<void>}
   * @private
   */
  async _decorateIdentity(identity) {
    const decoratedIdentity = Object.assign({}, identity)
    await Promise.all(
      decoratedIdentity.attestations.map(async attestationJson => {
        const attestation = JSON.parse(attestationJson)
        const attestationService = this._getAttestationService(attestation)
        switch (attestationService) {
          case 'email':
            decoratedIdentity.email = await this._loadValueFromAttestation(
              decoratedIdentity.id,
              'EMAIL'
            )
            break
          case 'phone':
            decoratedIdentity.phone = await this._loadValueFromAttestation(
              decoratedIdentity.id,
              'PHONE'
            )
            break
          case 'twitter':
            decoratedIdentity.twitter = await this._loadValueFromAttestation(
              decoratedIdentity.id,
              'TWITTER'
            )
            break
          case 'airbnb':
            decoratedIdentity.airbnb = await this._loadValueFromAttestation(
              decoratedIdentity.id,
              'AIRBNB'
            )
            break
          case 'facebook':
            // Note: we don't have access to the decoratedIdentity's fbook id,
            // only whether the account was verified or not.
            decoratedIdentity.facebookVerified = true
            break
          case 'google':
            decoratedIdentity.googleVerified = true
            break
        }
      })
    )
    return decoratedIdentity
  }

  /**
   * Indexes an identity in the DB.
   * @param {{}} result of identityQuery
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<void>}
   * @private
   */
  async _indexIdentity(identity, blockInfo) {
    // Decorate the user object with extra attestation related info.
    const decoratedIdentity = await this._decorateIdentity(identity)

    logger.info(`Indexing identity ${decoratedIdentity.id} in DB`)

    if (!Web3.utils.isAddress(decoratedIdentity.id)) {
      throw new Error(`Invalid eth address: ${decoratedIdentity.id}`)
    }

    // Construct an decoratedIdentity object based on the user's profile
    // and data loaded from the attestation table.
    const identityRow = {
      ethAddress: decoratedIdentity.id.toLowerCase(),
      firstName: decoratedIdentity.firstName,
      lastName: decoratedIdentity.lastName,
      email: decoratedIdentity.email,
      phone: decoratedIdentity.phone,
      airbnb: decoratedIdentity.airbnb,
      twitter: decoratedIdentity.twitter,
      facebookVerified: decoratedIdentity.facebookVerified || false,
      data: { blockInfo }
    }

    logger.debug('Identity=', identityRow)
    await db.Identity.upsert(identityRow)

    return decoratedIdentity
  }

  /**
   * Records a ProfilePublished event in the growth_event table.
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @param {Date} Event date.
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthProfileEvent(identity, blockInfo, date) {
    // Check required fields are populated.
    const validProfile =
      (identity.firstName.length > 0 || identity.lastName.length > 0) &&
      identity.avatar.length > 0
    if (!validProfile) {
      return
    }

    // Record the event.
    await GrowthEvent.insert(
      logger,
      identity.id,
      GrowthEventTypes.ProfilePublished,
      null,
      { blockInfo },
      date
    )
  }

  /**
   * Records AttestationPublished events in the growth_event table.
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @param {Date} Event date.
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthAttestationEvents(identity, blockInfo, date) {
    await Promise.all(
      identity.attestations.map(attestationJson => {
        // TODO: Clean this up
        const attestation = JSON.parse(attestationJson)
        const attestationService = this._getAttestationService(attestation)
        const eventType = AttestationServiceToEventType[attestationService]
        if (!eventType) {
          logger.error(
            `Unrecognized attestation service received: ${attestationService}. Skipping.`
          )
          return
        }

        return GrowthEvent.insert(
          logger,
          identity.id,
          eventType,
          null,
          { blockInfo },
          date
        )
      })
    )
  }

  /**
   * Main entry point for the identity event handler.
   * @param {Object} block
   * @param {Object} event
   * @returns {Promise<{user: User}>}
   */
  async process(block, event) {
    if (!this.config.identity) {
      return null
    }

    const account = event.returnValues.account

    logger.info(`Processing Identity event for account ${account}`)

    const identity = await this._getIdentityDetails(account)

    // Avatar can be large binary data. Clip it for logging purposes.
    if (identity.avatar) {
      identity.avatar = identity.avatar.slice(0, 32) + '...'
    }

    if (event.returnValues.ipfsHash) {
      identity.ipfsHash = bytes32ToIpfsHash(event.returnValues.ipfsHash)
    }

    const blockInfo = {
      blockNumber: event.blockNumber,
      logIndex: event.logIndex
    }
    const blockDate = new Date(block.timestamp * 1000)

    const decoratedIdentity = await this._indexIdentity(identity, blockInfo)

    if (this.config.growth) {
      await this._recordGrowthProfileEvent(identity, blockInfo, blockDate)
      await this._recordGrowthAttestationEvents(identity, blockInfo, blockDate)
    }

    return { identity: decoratedIdentity }
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
    return true
  }
}

module.exports = IdentityEventHandler
