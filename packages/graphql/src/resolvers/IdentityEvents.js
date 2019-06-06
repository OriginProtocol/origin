import graphqlFields from 'graphql-fields'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import pick from 'lodash/pick'
import get from 'lodash/get'
import contracts from '../contracts'
import { getIdsForPage, getConnection } from './_pagination'
import validateAttestation from '../utils/validateAttestation'
import { proxyOwner } from '../utils/proxy'

const websiteAttestationEnabled =
  process.env.ENABLE_WEBSITE_ATTESTATION === 'true'

const progressPct = {
  firstName: 10,
  lastName: 10,
  description: 10,
  avatar: 10,

  emailVerified: 10,
  phoneVerified: 10,
  facebookVerified: 10,
  twitterVerified: 10,
  googleVerified: 10,
  airbnbVerified: websiteAttestationEnabled ? 5 : 10,
  websiteVerified: websiteAttestationEnabled ? 5 : 0,
  kakaoVerified: 0,
  githubVerified: 0,
  linkedinVerified: 0
}

function getAttestations(account, attestations) {
  const result = {
    emailVerified: false,
    phoneVerified: false,
    facebookVerified: false,
    twitterVerified: false,
    airbnbVerified: false,
    googleVerified: false,
    websiteVerified: false,
    kakaoVerified: false,
    githubVerified: false,
    linkedinVerified: false
  }
  attestations.forEach(attestation => {
    if (validateAttestation(account, attestation)) {
      if (get(attestation, 'data.attestation.email.verified', false)) {
        result.emailVerified = true
      }
      if (get(attestation, 'data.attestation.phone.verified', false)) {
        result.phoneVerified = true
      }
      if (get(attestation, 'data.attestation.domain.verified', false)) {
        result.websiteVerified = true
      }
      const siteName = get(attestation, 'data.attestation.site.siteName')
      switch (siteName) {
        case 'facebook.com':
          result.facebookVerified = get(
            attestation,
            'data.attestation.site.userId.verified',
            false
          )
          break
        case 'airbnb.com':
          result.airbnbVerified = true
          break
        case 'twitter.com':
          result.twitterVerified = true
          break
        case 'google.com':
          result.googleVerified = true
          break
        case 'kakao.com':
          result.kakaoVerified = true
          break
        case 'github.com':
          result.githubVerified = true
          break
        case 'linkedin.com':
          result.linkedinVerified = true
          break
      }
    }
  })
  return result
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
    if (!ipfsHash) {
      const owner = await proxyOwner(id)
      if (owner) {
        accounts = [id, owner]
      }

      const events = await contracts.identityEvents.eventCache.getEvents({
        account: accounts
      })
      events.forEach(event => {
        if (blockNumber < event.blockNumber) {
          return
        }
        if (event.event === 'IdentityUpdated') {
          ipfsHash = event.returnValues.ipfsHash
        } else if (event.event === 'IdentityDeleted') {
          ipfsHash = null
        }
      })
      if (!ipfsHash) {
        return resolve(null)
      }
    }

    const data = await originIpfs.get(contracts.ipfsGateway, ipfsHash)
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
      ...getAttestations(accounts, data.attestations || []),
      strength: 0,
      ipfsHash,
      owner: {
        id
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
        identity.avatarUrl = 'ifps://' + avatarHash
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

    Object.keys(progressPct).forEach(key => {
      if (identity[key]) {
        identity.strength += progressPct[key]
      }
    })

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
  const buffer = new Buffer(parts[1], 'base64')
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
async function getAuthURL(provider, args) {
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

export default {
  id: contract => contract.options.address,
  identities,
  facebookAuthUrl: (_, args) => {
    return getAuthURL('facebook', args)
  },
  twitterAuthUrl: (_, args) => {
    return getAuthURL('twitter', args)
  },
  googleAuthUrl: (_, args) => {
    return getAuthURL('google', args)
  },
  kakaoAuthUrl: (_, args) => {
    return getAuthURL('kakao', args)
  },
  githubAuthUrl: (_, args) => {
    return getAuthURL('github', args)
  },
  linkedinAuthUrl: (_, args) => {
    return getAuthURL('linkedin', args)
  }
}
