const Sequelize = require('sequelize')
const Web3 = require('web3')
const logger = require('./logger')

const { bytes32ToIpfsHash } = require('./utils')
const db = {
  ...require('@origin/bridge/src/models'),
  ...require('@origin/identity/src/models'),
  ...require('../models')
}
const identityQuery = require('./queries/Identity')

const { GrowthEventTypes } = require('@origin/growth-event/src/enums')
const {
  AttestationServiceToEventType,
  GrowthEvent
} = require('@origin/growth-event/src/resources/event')
const { ip2geo } = require('@origin/ip2geo')

const siteNameToService = {
  'airbnb.com': 'airbnb',
  'facebook.com': 'facebook',
  'github.com': 'github',
  'google.com': 'google',
  'kakao.com': 'kakao',
  'linkedin.com': 'linkedin',
  'twitter.com': 'twitter',
  'wechat.com': 'wechat',
  'telegram.com': 'telegram'
}

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
      const service = siteNameToService[siteName]
      if (!service) {
        logger.error(`Unexpected siteName for attestation ${attestation}`)
      }
      return service
    } else if (attestation.data.attestation.phone) {
      return 'phone'
    } else if (attestation.data.attestation.email) {
      return 'email'
    } else if (attestation.data.attestation.domain) {
      return 'website'
    } else {
      logger.error(`Failed extracting service from attestation ${attestation}`)
    }
  }

  /**
   * Get details about an account from @origin/graphql
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
   * Loads the most recent attestation.
   * @param {Array<string>} addresses: Lower cased eth addresses
   * @param {string || null} method: Optional attestation method
   * @returns {Promise<Model<Attestation> || null>}
   * @private
   */
  async _loadMostRecentAttestation(addresses, method) {
    const where = { ethAddress: { [Sequelize.Op.in]: addresses } }
    if (method) {
      where.method = method
    }
    return await db.Attestation.findOne({
      where,
      order: [['id', 'DESC']],
      limit: 1
    })
  }

  /**
   * Loads attestation data such as email, phone, etc... from the attestation table.
   * @param {Array<string>} addresses
   * @param {string} method - 'EMAIL', 'PHONE', etc...
   * @returns {Promise<string|null>}
   * @private
   */
  async _loadValueFromAttestation(addresses, method) {
    // Loads the most recent value.
    const attestation = await this._loadMostRecentAttestation(addresses, method)
    if (!attestation) {
      logger.warn(`Could not find ${method} attestation for ${addresses}`)
      return null
    }
    return attestation.value
  }

  /**
   * Decorates an identity object with attestation data.
   * @param {{}} identity - result of identityQuery
   * @returns {Promise<Object>}
   * @private
   */
  async _loadAttestationMetadata(identity) {
    // Collect owner and proxy addresses for the identity.
    const owner = identity.owner.id.toLowerCase()
    const proxy = identity.owner.proxy
      ? identity.owner.proxy.id.toLowerCase()
      : null
    const addresses = [owner]
    if (proxy && proxy !== owner) {
      addresses.push(proxy)
    }

    // Load extra metadata such as social IDs from the attestation DB table.
    const attestations = identity.attestations.map(a => JSON.parse(a))
    return loadIdentityAttestationsMetadata(addresses, attestations)
  }

  /**
   * Indexes an identity in the DB.
   * @param {Object} identity: result of identityQuery
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @returns {Promise<Object>}
   * @private
   */
  async _indexIdentity(identity, blockInfo) {
    logger.info(`Indexing identity ${identity.id} in DB`)

    if (!Web3.utils.isAddress(identity.id)) {
      throw new Error(`Invalid eth address: ${identity.id}`)
    }

    // Construct a decoratedIdentity object based on the user's profile
    // and data loaded from the attestation table.
    // The identity is recorded under the user's wallet address (aka "owner")
    const metadata = await this._loadAttestationMetadata(identity)
    const identityRow = {
      ethAddress: identity.owner.id.toLowerCase(),
      ...metadata,
      data: { blockInfo }
    }

    logger.debug('Identity=', identityRow)
    await db.Identity.upsert(identityRow)

    return Object.assign({}, identity, metadata)
  }

  /**
   * Records a ProfilePublished event in the growth_event table
   * at the condition that the identity has a first name and last name.
   *
   * @param {Object} user - Origin js user model object.
   * @param {{blockNumber: number, logIndex: number}} blockInfo
   * @param {Date} Event date.
   * @returns {Promise<void>}
   * @private
   */
  async _recordGrowthProfileEvent(identity, blockInfo, date) {
    const validFirstName = identity.firstName && identity.firstName.length > 0
    const validLastName = identity.lastName && identity.lastName.length > 0

    const validProfile = validFirstName && validLastName
    if (!validProfile) {
      return
    }

    // Note: we log the event using the identity.id address which may be either
    // the owner or the proxy. The growth engine has logic to handle both.
    await GrowthEvent.insert(
      logger,
      1,
      identity.id,
      GrowthEventTypes.ProfilePublished,
      null,
      { blockInfo },
      date
    )
  }

  /**
   * Records AttestationPublished events in the growth_event table.
   * @param {Object} identity
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

        // Note: we log the event using the identity.id address which may be either
        // the owner or the proxy. The growth engine has logic to handle both.
        return GrowthEvent.insert(
          logger,
          1,
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

    // Skip malformed event.
    // See https://github.com/OriginProtocol/origin/issues/3581
    if (event.blockNumber === 8646689 && event.transactionIndex === 97) {
      logger.warn(
        'Skipping malformed event blockNumber=8646689 transactionIndex=97'
      )
      return null
    }

    const account = event.returnValues.account

    logger.info(`Processing Identity event for account ${account}`)

    const idWithBlock = account + '-' + event.blockNumber
    const identity = await this._getIdentityDetails(idWithBlock)

    // Avatar can be large binary data. Clip it for logging purposes.
    if (identity.avatar) {
      identity.avatar = identity.avatar.slice(0, 32) + '...'
    }

    if (event.returnValues.ipfsHash) {
      if (event.returnValues.ipfsHash !== identity.ipfsHash) {
        /**
         * GraphQL and the listener use two different instances of contracts,
         * with two different instances of EventCache.  It's possible, this is
         * also a JSON-RPC node sync issue...  They also use two different
         * EC queries (allEvents() vs getEvents({ account: '0x...' })), which
         * has a slight chance of causing this.  Be on the lookout for the
         * following log message:
         */
        logger.warn(
          `GraphQL IPFS hash does not match event IPFS hash. This is probably \
           a bug! (event: ${event.returnValues.ipfsHash}, GraphQL: \
           ${identity.ipfsHash}`
        )
      }
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
