import graphqlFields from 'graphql-fields'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import createDebug from 'debug'
import get from 'lodash/get'
import pick from 'lodash/pick'

import contracts from '../contracts'
import {
  getIdsForPage,
  getConnection,
  convertCursorToOffset
} from './_pagination'
import validateAttestation from '../utils/validateAttestation'
import { getProxyAndOwner } from '../utils/proxy'

const debug = createDebug('origin:identity:read')

const MAX_EVENT_IPFS_FETCH = 3

const progressPct = {
  firstName: 10,
  lastName: 10,
  description: 10,
  avatar: 10
}

const attestationProgressPct = {
  email: 10,
  phone: 10,
  facebook: 10,
  twitter: 10,
  google: 10,
  airbnb: 10,
  website: 10,
  kakao: 10,
  github: 10,
  linkedin: 10,
  wechat: 10,
  telegram: 10
}

/**
 * Filter out duplicate or unknown attestations.
 * @param {Array<Object>} attestations
 * @returns {Array<Object>}
 * @private
 */
function _sanitizeAttestations(attestations) {
  const m = new Map()
  // In case of multiple events for same provider,
  // only the latest one will be returned
  attestations.forEach(att => m.set(att.id, att))

  return getAttestationProviders().reduce((filtered, provider) => {
    if (m.has(provider)) {
      filtered.push(m.get(provider))
    }

    return filtered
  }, [])
}

/**
 * Parses attestation data from an identity and formats it to fit
 * into the graphQL schema defined for identity.
 *
 * @param {Array<string>} accounts: owner and optionally proxy eth address.
 * @param {Array<Object>} attestations: attestations from the identity data.
 * @returns {*}
 * @private
 */
function _getAttestations(accounts, attestations) {
  const verifiedAttestations = attestations
    .map(attestation => {
      if (!validateAttestation(accounts, attestation)) {
        return null
      }

      const issuedDate = {
        type: 'created',
        value: get(attestation, 'data.issueDate')
      }

      if (get(attestation, 'data.attestation.email.verified', false)) {
        return {
          id: 'email',
          rawData: JSON.stringify(attestation),
          properties: [issuedDate]
        }
      }
      if (get(attestation, 'data.attestation.phone.verified', false)) {
        return {
          id: 'phone',
          rawData: JSON.stringify(attestation),
          properties: [issuedDate]
        }
      }
      if (get(attestation, 'data.attestation.domain.verified', false)) {
        let domainName = get(
          attestation,
          'data.verificationMethod.pubAuditableUrl.proofUrl',
          ''
        )

        if (domainName) {
          try {
            domainName = new URL(domainName).origin
          } catch (e) {
            console.log(`Failed to parse domain ${domainName}: ${e.message}`)
          }
        }
        return {
          id: 'website',
          rawData: JSON.stringify(attestation),
          properties: [{ type: 'domainName', value: domainName }, issuedDate]
        }
      }

      const siteName = get(attestation, 'data.attestation.site.siteName')

      const userId = {
        type: 'userId',
        rawData: JSON.stringify(attestation),
        value: get(attestation, 'data.attestation.site.userId.raw')
      }

      const username = {
        type: 'username',
        rawData: JSON.stringify(attestation),
        value: get(attestation, 'data.attestation.site.username.raw')
      }

      const profileUrl = {
        type: 'profileUrl',
        rawData: JSON.stringify(attestation),
        value: get(attestation, 'data.attestation.site.profileUrl.raw')
      }

      switch (siteName) {
        case 'facebook.com':
          return {
            id: 'facebook',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate]
          }
        case 'airbnb.com':
          return {
            id: 'airbnb',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId]
          }
        case 'twitter.com':
          return {
            id: 'twitter',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId, username, profileUrl]
          }
        case 'google.com':
          return {
            id: 'google',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId, username]
          }
        case 'kakao.com':
          return {
            id: 'kakao',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId]
          }
        case 'github.com':
          return {
            id: 'github',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId, username, profileUrl]
          }
        case 'linkedin.com':
          return {
            id: 'linkedin',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId]
          }
        case 'wechat.com':
          return {
            id: 'wechat',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId]
          }
        case 'telegram.com':
          return {
            id: 'telegram',
            rawData: JSON.stringify(attestation),
            properties: [issuedDate, userId]
          }
      }

      return null
    })
    .filter(attestation => !!attestation)

  return _sanitizeAttestations(verifiedAttestations)
}

/**
 * Reads identity data associated with an Eth address from the identity server.
 *
 * @param {string} id: Eth address of the user.
 * @returns {Promise<Object||null>} Returns the identity object or null if no identity found.
 * @private
 */
async function _getIdentityFromIdentityServer(id) {
  const identityServer = contracts.config.identityServer
  if (!identityServer) {
    throw new Error('identityServer server not configured')
  }
  const url = `${identityServer}/api/identity?ethAddress=${id}`

  // Query the identity server.
  const response = await fetch(url, { credentials: 'include' })
  if (response.status === 204) {
    // No identity found for this eth address.
    return null
  }
  if (response.status !== 200) {
    throw new Error(`Query for identity ${id} failed`)
  }
  const data = await response.json()
  return { identity: data.identity, ipfsHash: data.ipfsHash }
}

/**
 * Reads identity data by querying the IdentityEvent smart contract and IPFS.
 * Steps:
 *  - query the IdentityEvents contract to fetch events emitted for the eth address
 *  - extract IPFS hashes from the events
 *  - fetch the most recent identity blob from IPFS
 *
 * @param {Array<string>} accounts: List with owner and optionally proxy address.
 * @param {Number} blockNumber: Optional for loading old identity data.
 * @returns {Promise<{identity: Object, ipfsHash: string}|null>}
 * @private
 */
async function _getIdentityFromContract(accounts, blockNumber) {
  if (!contracts.identityEvents.options.address || !accounts.length) {
    return null
  }

  // Load all events from the IdentityEvents contract that were emitted
  // by either the owner or the proxy.
  const events = await contracts.identityEvents.eventCache.getEvents({
    account: accounts
  })

  // Go thru all events and build a list of IPFS hashes, with most recent first.
  let ipfsHashes = []
  events.forEach(event => {
    if (blockNumber !== undefined && blockNumber < event.blockNumber) {
      return
    }
    if (event.event === 'IdentityUpdated') {
      ipfsHashes.unshift(event.returnValues.ipfsHash)
    } else if (event.event === 'IdentityDeleted') {
      ipfsHashes = []
    }
  })
  if (ipfsHashes.length < 1) {
    return null
  }

  // Go through each hash from most to least recent and stop once we find a valid one.
  let data = null
  let ipfsHash = null
  let fetchCount = 0
  for (const hash of ipfsHashes) {
    // TODO: Timeout too long?  What's reasonable here?
    try {
      data = await originIpfs.get(contracts.ipfsGateway, hash, 5000)
      fetchCount += 1
    } catch (err) {
      console.warn('error fetching identity data', err)
    }
    if (data || fetchCount >= MAX_EVENT_IPFS_FETCH) {
      ipfsHash = hash
      break
    }
  }
  return { identity: data, ipfsHash }
}

/**
 * Adds fields avatarUrl and avatarUrlExpanded to an identity.
 *  - avatarUrl is an IPFS url. Ex.: ipfs://QmWnTmoY6Pi5u3gxE9QSSFzw1MoCLgcd1Wg5mxTxzsL57c
 *  - avatarUrlExpanded is an HTTP URL pointing to an IPFS gateway.
 *    Ex.: https://ipfs.originprotocol.com/ipfs/QmaAsx4dt3LqiSCe4WCW1Pqkj67dh3wH1xBdUgukt6yWup
 *
 * @param {Object} identity
 * @private
 */
async function _decorateIdentityWithAvatarUrls(identity) {
  // Make old style embedded avatars access by their IPFS hash.
  if (
    identity.avatarUrl === undefined &&
    identity.avatar !== undefined &&
    identity.avatar.length > 0
  ) {
    try {
      const avatarBinary = dataURItoBinary(identity.avatar)
      const avatarHash = await IpfsHash.of(avatarBinary.buffer)
      identity.avatarUrl = 'ipfs://' + avatarHash
    } catch {
      // If we can't translate an old avatar for any reason, don't worry about it.
      // We've already tested the backfill script, and not seen a problem
      // for all valid avatar images.
    }
  }

  // We have 149 identity.avatarUrls missing the ipfs:// protocol.
  // Prepend ipfs:// if needed.
  if (
    identity.avatarUrl &&
    identity.avatarUrl.length === 46 &&
    identity.avatarUrl.indexOf('://') === -1
  ) {
    identity.avatarUrl = 'ipfs://' + identity.avatarUrl
  }

  if (identity.avatarUrl) {
    identity.avatarUrlExpanded = originIpfs.gatewayUrl(
      contracts.ipfsGateway,
      identity.avatarUrl
    )
  }
}

/**
 * Identity resolver
 *
 * @param {Object} args
 * @param {string} args.id: User account id. Format: "<ethAddress>-<blockNumber>".
 *   blockNumber is optional. It can be used to load older version of an identity.
 * @returns {{owner: {id: (*)}, proxy: {id: (*)}, strength: number, attestations: *, ipfsHash: *, id: *, verifiedAttestations: *}|any}
 */
export async function identity({ id }) {
  if (typeof localStorage !== 'undefined' && localStorage.useWeb3Identity) {
    return JSON.parse(localStorage.useWeb3Identity)
  }

  // Get blocknumber, owner and proxy address associated with the id.
  const [account, blockNumberStr] = id.split('-')
  const blockNumber = blockNumberStr ? Number(blockNumberStr) : undefined
  const { owner, proxy } = await getProxyAndOwner(account)
  const accounts = [owner, proxy].filter(x => x)

  // Load the IPFS data for the user's identity.
  let data
  if (contracts.config.centralizedIdentityEnabled) {
    data = await _getIdentityFromIdentityServer(owner)
  } else {
    data = await _getIdentityFromContract(accounts, blockNumber)
  }

  if (!data || !data.identity) {
    debug(`No identity found for ${id}`)
    return null
  }
  if (!data.ipfsHash) {
    throw new Error(`No IPFS hash for identity ${id}`)
  }

  // Create an identity object from the IPFS data.
  debug('Read identity', data)
  const { profile = {}, attestations = [] } = data.identity
  const identity = {
    id,
    attestations: attestations.map(a => JSON.stringify(a)),
    ...pick(profile, [
      'firstName',
      'lastName',
      'avatar',
      'avatarUrl',
      'description'
    ]),
    verifiedAttestations: _getAttestations(accounts, attestations),
    ipfsHash: data.ipfsHash,
    owner: {
      id: owner
    },
    proxy: {
      id: proxy
    }
  }

  // Format first, last and full names.
  if (identity.firstName) {
    identity.firstName = identity.firstName.substr(0, 20)
  }
  if (identity.lastName) {
    identity.lastName = identity.lastName.substr(0, 20)
  }

  identity.fullName = [identity.firstName, identity.lastName]
    .filter(n => n)
    .join(' ')

  // Add avatar URLs to the identity object.
  await _decorateIdentityWithAvatarUrls(identity)

  // Compute a profile strength based firstName, lastName, and attestations that are filled in.
  Object.keys(progressPct).forEach(key => {
    if (identity[key]) {
      identity.strength += progressPct[key]
    }
  })
  Array.from(identity.verifiedAttestations || []).map(attestation => {
    identity.strength += attestationProgressPct[attestation.id] || 0
  })
  identity.strength = Math.max(identity.strength, 100)

  return identity
}

/**
 * Extracts binary data and mime type from a data URI.
 *
 * @param dataURI
 * @returns {{buffer: Buffer, mimeType: string}}
 */
function dataURItoBinary(dataURI) {
  const parts = dataURI.split(',')
  const mimeType = parts[0].split(':')[1].split(';')[0]
  const buffer = Buffer.from(parts[1], 'base64')
  return { buffer, mimeType }
}

/**
 * Queries the identity server to get <first> identities starting at cursor <after>.
 *
 * @param {Integer} first: the number of identities to fetch (e.g. limit).
 * @param {string} after: cursor.
 * @returns {Promise<{start: *, ids: *, totalCount: *, first: *}>}
 * @private
 */
async function _getIdentitiesFromIdentityServer(first, after) {
  const identityServer = contracts.config.identityServer
  if (!identityServer) {
    throw new Error('identityServer server not configured')
  }
  const offset = after ? convertCursorToOffset(after) : 0
  const url = `${identityServer}/api/identity/list?limit=${first}&offset=${offset}`

  // Query the identity server.
  const response = await fetch(url, { credentials: 'include' })
  if (response.status !== 200) {
    throw new Error(`Query for ${first} identities at offset ${after} failed`)
  }
  const data = await response.json()
  return {
    start: first + offset + 1,
    ids: data.identities.map(identity => identity.ethAddress),
    totalCount: data.totalCount
  }
}

/**
 * Queries the blockchain to get <first> identities starting at cursor <after>.
 * TODO: This is very inefficient as it scans the entire event set.
 *       Optimize if our user base grows to a significant size...
 *
 * @param {Object} contract: Identity contract
 * @param {Integer} first: the number of identities to fetch (e.g. limit).
 * @param {string} after: cursor.
 * @returns {Promise<{start: *, ids: *, totalCount: *, first: *}>}
 * @private
 */
async function _getIdentitiesFromBlockchain(contract, first, after) {
  // Build a list of identity eth addresses by scanning
  // all the events from the blockchain.
  const events = await contract.eventCache.allEvents()
  const allIds = new Set()
  events.forEach(event => {
    const id = event.returnValues.account
    if (!id) {
      return
    }
    if (event.event === 'IdentityUpdated') {
      allIds.add(id)
    } else if (event.event === 'IdentityDeleted') {
      allIds.delete(id)
    }
  })
  const page = getIdsForPage({ after, ids: allIds, first })
  return { start: page.start, ids: page.ids, totalCount: allIds.length }
}

/**
 * Returns a paginated list of all identities.
 * Used by admin, not by the DApp.
 *
 * @param {Object} contract: IdentityEvents contract
 * @param {Number} first: number of identities desired
 * @param {string} after: encoded cursor. Decode with _pagination.convertCursorToOffset
 * @param {Object} context: GraphQL context
 * @param {Object} info: GraphQL info
 * @returns {Promise<null|{nodes, pageInfo, edges, totalCount}>}
 */
export async function identities(
  contract,
  { first = 10, after },
  context,
  info
) {
  if (!contract) {
    return null
  }

  const fields = graphqlFields(info)

  // Get the list of identity addresses.
  let data
  if (contracts.config.centralizedIdentityEnabled) {
    // Call the server to get a page of identity addresses.
    data = await _getIdentitiesFromIdentityServer(first, after)
  } else {
    // Get identity addresses by querying the blockchain.
    data = await _getIdentitiesFromBlockchain(contract, first, after)
  }
  const { start, ids, totalCount } = data

  // Fetch the identities.
  let nodes = []
  if (!fields || fields.nodes) {
    nodes = await Promise.all(ids.map(id => identity({ id })))
  }

  return getConnection({ start, first, nodes, ids, totalCount })
}

/**
 * Returns authorization URL for all attestation providers
 * @param {String} provider One of supported attestation provider
 * @param {Object} args Arguments from GraphQL query resolver
 */
async function getAuthUrl(provider, args) {
  const bridgeServer = contracts.config.bridge
  if (!bridgeServer) {
    return null
  }
  let authUrl = `${bridgeServer}/api/attestations/${provider}/auth-url`
  if (args.redirect) {
    authUrl += `?redirect=${args.redirect}`
  }
  const response = await fetch(authUrl, {
    headers: { 'content-type': 'application/json' },
    credentials: 'include'
  })
  const authData = await response.json()
  return authData.url
}

/**
 * Returns a list of all supported attestation providers
 */
function getAttestationProviders() {
  // The order of this list will affect the order of rendering in DApp
  const ATTESTATION_PROVIDERS = [
    'email',
    'phone',
    'facebook',
    'twitter',
    'airbnb',
    'google',
    'website',
    'kakao',
    'github',
    'linkedin',
    'telegram'
  ]

  if (process.env.ENABLE_WECHAT_ATTESTATION === 'true') {
    ATTESTATION_PROVIDERS.push('wechat')
  }

  return ATTESTATION_PROVIDERS
}

export default {
  id: contract => contract.options.address,
  identities,
  getAuthUrl: (_, { provider, ...args }) => getAuthUrl(provider, args),
  attestationProviders: () => getAttestationProviders()
}
