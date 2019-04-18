import graphqlFields from 'graphql-fields'
import originIpfs from '@origin/ipfs'
import pick from 'lodash/pick'
import get from 'lodash/get'
import contracts from '../contracts'
import { getIdsForPage, getConnection } from './_pagination'
import validateAttestation from '../utils/validateAttestation'

const progressPct = {
  firstName: 10,
  lastName: 10,
  description: 10,
  avatar: 10,

  emailVerified: 15,
  phoneVerified: 15,
  facebookVerified: 10,
  twitterVerified: 10,
  airbnbVerified: 10
}

function getAttestations(account, attestations) {
  const result = {
    emailVerified: false,
    phoneVerified: false,
    facebookVerified: false,
    twitterVerified: false,
    airbnbVerified: false,
    googleVerified: false
  }
  attestations.forEach(attestation => {
    if (validateAttestation(account, attestation)) {
      if (get(attestation, 'data.attestation.email.verified', false)) {
        result.emailVerified = true
      }
      if (get(attestation, 'data.attestation.phone.verified', false)) {
        result.phoneVerified = true
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
  return new Promise(async resolve => {
    if (!contracts.identityEvents.options.address || !id) {
      return null
    }
    if (!ipfsHash) {
      const events = await contracts.identityEvents.eventCache.getEvents({
        account: id.toLowerCase()
      })
      events.forEach(event => {
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
      ...pick(profile, ['firstName', 'lastName', 'avatar', 'description']),
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

    Object.keys(progressPct).forEach(key => {
      if (identity[key]) {
        identity.strength += progressPct[key]
      }
    })

    resolve(identity)
  })
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
  facebookAuthUrl: async () => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return null
    }
    const authUrl = `${bridgeServer}/api/attestations/facebook/auth-url`
    const response = await fetch(authUrl, {
      headers: { 'content-type': 'application/json' }
    })
    const authData = await response.json()
    return authData.url
  },
  googleAuthUrl: async () => {
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      return null
    }
    const authUrl = `${bridgeServer}/api/attestations/google/auth-url`
    const response = await fetch(authUrl, {
      headers: { 'content-type': 'application/json' }
    })
    const authData = await response.json()
    return authData.url
  }
}
