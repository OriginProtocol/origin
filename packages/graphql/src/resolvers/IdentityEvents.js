import graphqlFields from 'graphql-fields'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import pick from 'lodash/pick'
import get from 'lodash/get'
import contracts from '../contracts'
import { getIdsForPage, getConnection } from './_pagination'
import validateAttestation from '../utils/validateAttestation'
import { proxyOwner, hasProxy } from '../utils/proxy'

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

function getAttestations(account, attestations) {
  const verifiedAttestations = attestations
    .map(attestation => {
      if (!validateAttestation(account, attestation)) {
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

  return sortAttestations(verifiedAttestations)
}

function sortAttestations(attestations) {
  const m = new Map()
  // In case of a multiple events for same provider,
  // only the latest one will be returned
  attestations.forEach(att => m.set(att.id, att))

  return getAttestationProviders().reduce((filtered, provider) => {
    if (m.has(provider)) {
      filtered.push(m.get(provider))
    }

    return filtered
  }, [])
}

export function identity({ id, ipfsHash }) {
  if (typeof localStorage !== 'undefined' && localStorage.useWeb3Identity) {
    return JSON.parse(localStorage.useWeb3Identity)
  }

  const [account, blockNumber] = id.split('-')
  id = account
  return new Promise(async resolve => {
    if (!contracts.identityEvents.options.address || !id) {
      return null
    }
    let accounts = id
    let owner, proxy
    let ipfsHashes = []
    if (!ipfsHash) {
      owner = await proxyOwner(id)
      if (owner) {
        accounts = [id, owner]
      } else {
        proxy = await hasProxy(id)
        if (proxy) {
          accounts = [id, proxy]
        }
      }

      const events = await contracts.identityEvents.eventCache.getEvents({
        account: accounts
      })
      events.forEach(event => {
        if (blockNumber < event.blockNumber) {
          return
        }
        if (event.event === 'IdentityUpdated') {
          ipfsHashes.unshift(event.returnValues.ipfsHash)
        } else if (event.event === 'IdentityDeleted') {
          ipfsHashes = []
        }
      })
      if (ipfsHashes.length < 1) {
        return resolve(null)
      }
    } else {
      ipfsHashes.push(ipfsHash)
    }

    // Go through each hash until we get valid data
    let data
    let fetchCount = 0
    for (const hash of ipfsHashes) {
      // TODO: Timeout too long?  What's reasonable here?
      try {
        data = await originIpfs.get(contracts.ipfsGateway, hash, 5000)
        fetchCount += 1
      } catch (err) {
        console.warn('error fetching identity data', err)
      }
      if (data || fetchCount >= MAX_EVENT_IPFS_FETCH) break
    }
    if (!data) {
      return resolve(null)
    }
    const { profile = {}, attestations = [] } = data

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
      verifiedAttestations: getAttestations(accounts, data.attestations || []),
      strength: 0,
      ipfsHash,
      owner: {
        id: owner ? owner : id
      },
      proxy: {
        id: proxy ? proxy : id
      }
    }

    if (identity.firstName) {
      identity.firstName = identity.firstName.substr(0, 20)
    }
    if (identity.lastName) {
      identity.lastName = identity.lastName.substr(0, 20)
    }

    identity.fullName = [identity.firstName, identity.lastName]
      .filter(n => n)
      .join(' ')

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

    // Strength for firstName, lastName, etc..
    Object.keys(progressPct).forEach(key => {
      if (identity[key]) {
        identity.strength += progressPct[key]
      }
    })

    // Strength for attestations
    Array.from(identity.verifiedAttestations || []).map(attestation => {
      identity.strength += attestationProgressPct[attestation.id] || 0
    })
    if (identity.strength > 100) {
      identity.strength = 100
    }

    resolve(identity)
  })
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

  const events = await contract.eventCache.allEvents()

  const identities = {}
  events.forEach(event => {
    const id = event.returnValues.account
    if (id) {
      identities[id] = identities[id] || { id }
      if (event.event === 'IdentityUpdated') {
        identities[id].ipfsHash = event.returnValues.ipfsHash
      } else if (event.event === 'IdentityDeleted') {
        identities[id].ipfsHash = null
      }
    }
  })

  const totalCount = Object.keys(identities).length
  const allIds = Object.keys(identities)

  const { ids, start } = getIdsForPage({ after, ids: allIds, first })

  let nodes = []
  if (!fields || fields.nodes) {
    nodes = await Promise.all(ids.map(id => identity(identities[id])))
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
