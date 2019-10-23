const originIpfs = require('@origin/ipfs')
const contracts = require('@origin/graphql/src/contracts')

const get = require('lodash/get')
const Web3 = require('web3')
const logger = require('./logger')

const db = {
  ...require('@origin/identity/src/models'),
  ...require('../models')
}
const identityQuery = require('./queries/Identity')
const validator = require('@origin/validator')

const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  loadIdentityAttestationsMetadata,
  recordGrowthProfileEvent,
  recordGrowthAttestationEvents
} = require('@origin/identity/src/utils')

class IdentityEventHandler {
  constructor(config, graphqlClient) {
    this.config = config
    this.graphqlClient = graphqlClient
  }

  /**
   * Queries graphQL to get informataion about an account.
   *
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
   * Loads an identity's JSON blob from IPFS and validates it.
   *
   * @param ipfsHash
   * @returns {Promise<Object>}
   * @private
   */
  async _loadAndValidateIpfsIdentity(ipfsHash) {
    // Load the identity blob from IPFS.
    const ipfsData = await originIpfs.get(contracts.ipfsGateway, ipfsHash, 5000)

    // Parse the identity data to make sure it is valid.
    // Throws in case of an error.
    validator(
      'https://schema.originprotocol.com/identity_1.0.0.json',
      ipfsData.identity
    )
    validator(
      'https://schema.originprotocol.com/profile_2.0.0.json',
      ipfsData.profile
    )
    ipfsData.attestations.forEach(a => {
      validator('https://schema.originprotocol.com/attestation_1.0.0.json', a)
    })
    return ipfsData
  }

  /**
   * Helper function for loading owner and proxy addresses.
   *
   * @param {string} account: Cna be either an owner or proxy address.
   * @returns {Promise<{owner: *, proxy: *, addresses: *}>}
   * @private
   */
  async _getAccountInfo(account) {
    const identity = this._getIdentityDetails(account)

    // Collect owner and proxy addresses for the identity.
    const owner = identity.owner.id
    const proxy =
      identity.owner.proxy && identity.owner.proxy !== owner
        ? identity.owner.proxy
        : null

    const addresses = new Set([owner])
    addresses.add(proxy)

    return { owner, proxy, addresses }
  }

  /**
   * Indexes an identity in the DB.
   *
   * @param {{owner:string, proxy: sting||null, addresses:Array<string>}} accountInfo
   * @param {string} ipfsHash
   * @param {string} ipfsData: Identity JSON blob stored in IPFS.
   * @returns {Promise<Object>} An identity object as written to the DB.
   * @private
   */
  async _indexIdentity(accountInfo, ipfsHash, ipfsData) {
    // Load attestation data from the DB.
    const metadata = await loadIdentityAttestationsMetadata(
      accountInfo.addresses,
      ipfsData.attestations
    )

    // Create an object representing the updated identity.
    // Note that by convention, the identity is stored under the owner's address in the DB.
    const identity = {
      ethAddress: accountInfo.owner,
      firstName: get(ipfsData, 'profile.firstName'),
      lastName: get(ipfsData, 'profile.lastName'),
      avatarUrl: get(ipfsData, 'profile.avatarUrl'),
      data: {
        identity: ipfsData,
        ipfsHash: ipfsHash,
        ipfsHashHistory: []
      },
      ...metadata
    }

    logger.debug('Writing identity:', identity)
    await db.Identity.upsert(identity)

    return identity
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
    const eventId = `${event.blockNumber}:${event.transactionIndex}`
    logger.debug(`Identity handler processing event ${eventId}`)

    // TODO(franck): confirm we can remove this HACK
    // Skip malformed event.
    // See https://github.com/OriginProtocol/origin/issues/3581
    //if (event.blockNumber === 8646689 && event.transactionIndex === 97) {
    //  logger.warn(
    //    'Skipping malformed event blockNumber=8646689 transactionIndex=97'
    //  )
    //  return null
    //}

    const account = get(event, 'returnValues.account')
    let ipfsHash = get(event, 'returnValues.ipfsHash')

    if (!account || !Web3.utils.isAddress(account)) {
      logger.error(`Skipping event with invalid account: ${eventId}`)
      return null
    }
    if (!ipfsHash) {
      logger.error(`Skipping event with no IPFS hash ${eventId}`)
      return null
    }
    logger.info(`Identity account ${account}, hash ${ipfsHash}`)

    // Load the identity JSON data from IPFS.
    let ipfsData
    try {
      ipfsHash = originIpfs.getIpfsHashFromBytes32(ipfsHash)
      ipfsData = await this._loadAndValidateIpfsIdentity(ipfsHash)
    } catch (err) {
      logger.error(`Failed loading IPFS data for hash ${ipfsHash}:`, err)
      return null
    }

    // Get the account's addresses.
    const accountInfo = await this._getAccountInfo(account)

    // Write the updated identity in the DB.
    const identity = await this._indexIdentity(accountInfo, ipfsHash, ipfsData)

    // Insert growth events using the blockchain date as timestamp.
    if (this.config.growth) {
      const blockDate = new Date(block.timestamp * 1000)
      await recordGrowthProfileEvent(
        accountInfo.owner,
        identity,
        blockDate,
        GrowthEvent
      )
      await recordGrowthAttestationEvents(
        accountInfo.owner,
        ipfsData.attestations,
        blockDate,
        GrowthEvent
      )
    }

    return { identity }
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
