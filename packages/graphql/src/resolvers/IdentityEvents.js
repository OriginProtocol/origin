import graphqlFields from 'graphql-fields'
import originIpfs from '@origin/ipfs'
import IpfsHash from 'ipfs-only-hash'
import pick from 'lodash/pick'
import get from 'lodash/get'
import contracts from '../contracts'
import { getIdsForPage, getConnection } from './_pagination'
import validateAttestation from '../utils/validateAttestation'

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
  websiteVerified: websiteAttestationEnabled ? 5 : 0
}

function getAttestations(account, attestations) {
  const result = {
    emailVerified: false,
    phoneVerified: false,
    facebookVerified: false,
    twitterVerified: false,
    airbnbVerified: false,
    googleVerified: false,
    websiteVerified: false
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
      if (siteName === 'facebook.com') {
        result.facebookVerified = get(
          attestation,
          'data.attestation.site.userId.verified',
          false
        )
      }
      if (siteName === 'airbnb.com') {
        result.airbnbVerified = true
      }
      if (siteName === 'twitter.com') {
        result.twitterVerified = true
      }
      if (siteName === 'google.com') {
        result.googleVerified = true
      }
    }
  })
  return result
}

export function identity({ id, ipfsHash }) {
  const [account, blockNumber] = id.split('-')
  id = account
  return new Promise(async resolve => {
    if (!contracts.identityEvents.options.address || !id) {
      return null
    }
    if (!ipfsHash) {
      const events = await contracts.identityEvents.eventCache.getEvents({
        account: id
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
      ...getAttestations(id, data.attestations || []),
      strength: 0,
      ipfsHash
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
    if (identity.avatarUrl === undefined && identity.avatar !== undefined) {
      try {
        const avatarBinary = dataURItoBinary(identity.avatar)
        identity.avatarUrl = await IpfsHash.of(Buffer.from(avatarBinary.buffer))
      } catch {
        // If we can't translate an old avatar for any reason, don't worry about it.
        // We've already tested the backfill script, and not seen a problem
        // for all valid avatar images.
      }
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

function dataURItoBinary(dataURI) {
  // From https://stackoverflow.com/questions/12168909/blob-from-dataurl
  const parts = dataURI.split(',')
  const byteString = atob(parts[1])
  const mimeString = parts[0].split(':')[1].split(';')[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  const blob = new Blob([ab], { type: mimeString })
  return { blob, buffer: ab }
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

export default {
  id: contract => contract.options.address,
  identities,
  facebookAuthUrl: async (_, args) => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return null
    }
    let authUrl = `${bridgeServer}/api/attestations/facebook/auth-url`
    if (args.redirect) {
      authUrl += `?redirect=${args.redirect}`
    }
    const response = await fetch(authUrl, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include'
    })
    const authData = await response.json()
    return authData.url
  },
  twitterAuthUrl: async (_, args) => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return null
    }
    let authUrl = `${bridgeServer}/api/attestations/twitter/auth-url`
    if (args.redirect) {
      authUrl += `?redirect=${args.redirect}`
    }
    const response = await fetch(authUrl, {
      headers: { 'content-type': 'application/json' },
      credentials: 'include'
    })
    const authData = await response.json()
    return authData.url
  },
  googleAuthUrl: async (_, args) => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return null
    }
    let authUrl = `${bridgeServer}/api/attestations/google/auth-url`
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
}
