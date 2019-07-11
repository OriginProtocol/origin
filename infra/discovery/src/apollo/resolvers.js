const GraphQLJSON = require('graphql-type-json')
const logger = require('./logger')
const search = require('../lib/search')
const db = require('../models')
const Web3 = require('web3')

const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545')

// Resolvers define the technique for fetching the types in the schema.
const resolvers = {
  JSON: GraphQLJSON,
  Query: {
    async listings(root, args) {
      // Get listing Ids from Elastic.
      const { listingIds, stats } = await search.Listing.search(
        args.searchQuery,
        args.filters,
        args.page.numberOfItems,
        args.page.offset,
        true // idsOnly
      )
      logger.info(
        `Query: "${args.searchQuery}" returned ${listingIds.length} results.`
      )
      return {
        nodes: listingIds.map(x => Object.assign({}, { id: x })),
        offset: args.page.offset,
        numberOfItems: listingIds.length,
        totalNumberOfItems: stats.totalNumberOfListings,
        stats: {
          maxPrice: stats.maxPrice,
          minPrice: stats.minPrice
        }
      }
    },

    async listing(root, args, context, info) {
      // Check if moderator access is required
      const moderatorOnlyFields = ['scoreTags', 'scoreMultiplier']
      const selections = info.fieldNodes[0].selectionSet.selections
      const requestedModFields = selections.filter(
        x => x.name && moderatorOnlyFields.includes(x.name.value)
      )
      if (requestedModFields.length > 0) {
        const auth = await authenticate(context.discoveryAuthToken)
        if (!auth) {
          throw new Error(
            'You must be a moderator in order to view these fields'
          )
        }
      }
      // Load a listing
      const id = args.id
      const listing = await search.Listing.get(id)
      if (listing._source.scoreTags === undefined) {
        listing._source.scoreTags = []
      }
      return listing._source
    },

    info() {
      // Caution: Any config added here gets exposed publicly.
      // Make sure to not expose any credentials/secrets !
      return {
        networkId: process.env.NETWORK_ID
          ? process.env.NETWORK_ID
          : 'undefined',
        elasticsearchHost: process.env.ELASTICSEARCH_HOST
          ? process.env.ELASTICSEARCH_HOST
          : 'undefined',
        nodeEnv: process.env.NODE_ENV ? process.env.NODE_ENV : 'undefined'
      }
    }
  },
  Mutation: {
    async listingSetScoreTags(_, data, context) {
      const auth = await authenticate(context.discoveryAuthToken)
      if (!auth) {
        throw new Error('You are not logged in')
      }
      const { ethAddress } = auth

      const { id, scoreTags } = data
      await db.DiscoveryTagAction.create({
        ethAddress: ethAddress.toLowerCase(),
        ListingId: id,
        data: { tags: scoreTags }
      })
      logger.info('Tags set for', id, 'to', scoreTags, 'by', ethAddress)
      return search.Listing.updateScoreTags(id, scoreTags)
    },

    async accessTokenCreate(_, data) {
      const { message, signature } = data
      const ethAddress = data.ethAddress.toLowerCase()
      const recoveredAddress = web3.eth.accounts.recover(message, signature)
      if (!recoveredAddress) {
        throw new Error('Unable to recover signed message sender')
      }
      if (ethAddress != recoveredAddress.toLowerCase()) {
        throw new Error('Signature did not match ethAddress')
      }
      if (!canModerate(ethAddress)) {
        throw new Error('This eth address is not allowed to moderate listings')
      }

      const match = message.match(
        // eslint-disable-next-line no-control-regex
        /^\u0019Ethereum Signed Message:\nOrigin Moderation Login\nNonce: (0x[a-fA-F0-9]+)$/
      )
      if (!match) {
        throw new Error('Message was not correctly formatted')
      }
      const nonce = match[1]
      const usedCount = await db.DiscoveryAccessToken.count({
        where: { nonce, ethAddress }
      })
      if (usedCount > 0) {
        throw new Error('Nonces may only be used one time')
      }

      const authToken = Web3.utils.randomHex(16)
      const secondsToExpiration = 36 * 60 * 60
      const now = new Date().getTime()
      const expires = new Date(now + secondsToExpiration * 1000)

      await db.DiscoveryAccessToken.create({
        authToken,
        ethAddress,
        nonce,
        expires
      })
      logger.info('Access token created for', ethAddress)
      return {
        authToken,
        secondsToExpiration,
        ethAddress
      }
    }
  }
}

async function authenticate(authToken) {
  if (!authToken) {
    return undefined
  }
  const accessToken = await db.DiscoveryAccessToken.findOne({
    where: { authToken }
  })
  if (!accessToken) {
    logger.info('Failed Auth. No matching token found in DB')
    return undefined
  }
  if (accessToken.expires < new Date()) {
    logger.info('Failed Auth. Expired token')
    return undefined
  }
  if (!canModerate(accessToken.ethAddress)) {
    logger.info('Failed Auth. Eth address has had moderator access removed')
    return undefined
  }
  return accessToken
}

function canModerate(ethAddress) {
  if (!process.env.MODERATOR_ADDRESSES) {
    logger.error(
      'MODERATOR_ADDRESSES env variable not set. Refusing all logins.'
    )
    return false
  }
  return process.env.MODERATOR_ADDRESSES.toLowerCase()
    .split(',')
    .includes(ethAddress.toLowerCase())
}

module.exports = resolvers
