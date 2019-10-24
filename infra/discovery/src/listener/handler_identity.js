const get = require('lodash/get')
const Web3 = require('web3')

const originIpfs = require('@origin/ipfs')
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  convertLegacyAvatar,
  loadAttestationMetadata,
  recordGrowthAttestationEvents,
  recordGrowthProfileEvent,
  saveIdentity,
  validateIdentityIpfsData
} = require('@origin/identity/src/utils')

const logger = require('./logger')
const identityQuery = require('./queries/Identity')

class IdentityEventHandler {
  constructor(context, graphqlClient) {
    this.config = context.config
    this.ipfsGateway = context.contracts.ipfsGateway
    this.graphqlClient = graphqlClient
  }

  /**
   * Queries graphQL to get information about an account.
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
   * Throws an exception in case of failure.
   *
   * @param ipfsHash
   * @returns {Promise<Object>}
   * @private
   */
  async _loadAndValidateIpfsIdentity(ipfsHash) {
    // Load the identity blob from IPFS.
    const ipfsData = await originIpfs.get(this.ipfsGateway, ipfsHash, 5000)
    // Validate the data.
    validateIdentityIpfsData(ipfsData)
    return ipfsData
  }

  /**
   * Helper function for loading owner and proxy addresses.
   * Returns lower cased addresses.
   *
   * @param {string} account: Can be either an owner or proxy address.
   * @returns {Promise<{owner: string, proxy: string, addresses: Array<string>}>}
   * @private
   */
  async _getAccountInfo(account) {
    const identity = await this._getIdentityDetails(account)

    // Collect owner address and the optional proxy address for the identity.
    const owner = identity.owner.id.toLowerCase()
    const proxy =
      identity.owner.proxy && identity.owner.proxy.id !== owner
        ? identity.owner.proxy.id.toLowerCase()
        : null

    const addresses = [owner]
    if (proxy) addresses.push(proxy)

    return { owner, proxy, addresses }
  }

  /**
   * Main entry point for the identity event handler.
   * @param {Object} block
   * @param {Object} event
   * @returns {Promise<{identity: Object}>}
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

    // Some legacy identities were storing the avatar picture
    // as data URI in the profile data. Convert those to the new format
    // where the avatar picture is stored as a separate IPFS blob.
    if (ipfsData.profile.avatar && ipfsData.profile.avatar.length > 0) {
      logger.debug('Converting to new style avatar.')
      await convertLegacyAvatar(this.ipfsGateway, ipfsData)
    }

    // Get the account's addresses.
    const accountInfo = await this._getAccountInfo(account)

    // Load attestation data from the DB.
    const metadata = await loadAttestationMetadata(
      accountInfo.addresses,
      ipfsData.attestations
    )

    // Save the identity in the DB.
    const identity = await saveIdentity(
      accountInfo.owner,
      ipfsHash,
      ipfsData,
      metadata
    )
    logger.debug('Wrote identity:', identity)

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
