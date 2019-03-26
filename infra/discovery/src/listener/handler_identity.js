const Web3 = require('web3')
const logger = require('./logger')

const { bytes32ToIpfsHash } = require('./utils')
const _bridgeModels = require('@origin/bridge/src/models')
const _identityModels = require('@origin/identity/src/models')
const _discoveryModels = require('../models')
const db = { ..._bridgeModels, ..._discoveryModels, ..._identityModels }
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


  /* Get deteails about an account from @origin/graphql
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
    return attestation ? attestation.value : null
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
      decoratedIdentity.attestations.map(async attestation => {
        switch (attestation.service) {
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

    logger.info(`Indexing identity ${decoratedIdentity.address} in DB`)

    if (!Web3.utils.isAddress(decoratedIdentity.address)) {
      throw new Error(`Invalid eth address ${decoratedIdentity.address}`)
    }

    // Construct an decoratedIdentity object based on the user's profile
    // and data loaded from the attestation table.
    const identityRow = {
      ethAddress: decoratedIdentity.address.toLowerCase(),
      firstName: decoratedIdentity.profile.firstName,
      lastName: decoratedIdentity.profile.lastName,
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
    // Check profile is populated.
    const validProfile =
      (identity.profile.firstName.length > 0 ||
        identity.profile.lastName.length > 0) &&
      identity.avatar.length > 0
    if (!validProfile) {
      return
    }

    // Record the event.
    await GrowthEvent.insert(
      logger,
      identity.address,
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
      identity.attestations.map(attestation => {
        const eventType = AttestationServiceToEventType[attestation.service]
        if (!eventType) {
          logger.error(
            `Unrecognized attestation service received: ${
              attestation.service
            }. Skipping.`
          )
          return
        }

        return GrowthEvent.insert(
          logger,
          identity.address,
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
   * @param {Object} log
   * @returns {Promise<{user: User}>}
   */
  async process(log) {
    if (!this.config.identity) {
      return null
    }

    const account = log.decoded.account

    logger.info(`Processing Identity event for account ${account}`)

    const identity = await this._getIdentityDetails(account)

    // Avatar can be large binary data. Clip it for logging purposes.
    if (identity.avatar) {
      identity.avatar = identity.avatar.slice(0, 32) + '...'
    }

    if (log.decoded.ipfsHash) {
      identity.ipfsHash = bytes32ToIpfsHash(log.decoded.ipfsHash)
    }

    const blockInfo = {
      blockNumber: log.blockNumber,
      logIndex: log.logIndex
    }

    const decoratedIdentity = await this._indexIdentity(identity, blockInfo)

    if (this.config.growth) {
      await this._recordGrowthProfileEvent(identity, blockInfo, log.date)
      await this._recordGrowthAttestationEvents(identity, blockInfo, log.date)
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
