import graphqlFields from 'graphql-fields'
import stringify from 'json-stable-stringify'
import { getIdsForPage, getConnection } from './_pagination'
import originIpfs from 'origin-ipfs'
import pick from 'lodash/pick'
import get from 'lodash/get'
import contracts from '../contracts'

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
    airbnbVerified: false
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
    }
  })
  return result
}

function validateAttestation(account, attestation) {
  const web3 = contracts.web3
  const issuer = (
    contracts.config.attestationIssuer ||
    '0x5be37555816d258f5e316e0f84D59335DB2400B2'
  ).toLowerCase()
  if (issuer !== attestation.data.issuer.ethAddress.toLowerCase()) {
    console.log(
      `Attestation issuer address validation failure.
      Account ${account}
      Expected issuer ${issuer}, got ${attestation.data.issuer.ethAddress}`
    )
    return false
  }

  // Note: we use stringify rather than the default JSON.stringify
  // to produce a deterministic JSON representation of the data that was signed.
  // Similarly, we make sure to user checksummed eth address.
  const attestationJson = stringify(attestation.data)
  const message = web3.utils.soliditySha3(
    web3.utils.toChecksumAddress(account),
    web3.utils.sha3(attestationJson)
  )
  const messageHash = web3.eth.accounts.hashMessage(message)
  const signerAddress = web3.eth.accounts.recover(
    messageHash,
    attestation.signature.bytes,
    true
  )
  if (signerAddress.toLowerCase() !== issuer) {
    console.log(
      `Attestation signature validation failure.
      Account ${account}
      Expected issuer ${issuer}, got ${signerAddress}`
    )
    return false
  }
  return true
}

export function identity({ id, ipfsHash }) {
  return new Promise(async resolve => {
    if (!contracts.identityEvents.options.address || !id) {
      return null
    }
    if (!ipfsHash) {
      const events = await contracts.identityEvents.eventCache.allEvents(
        undefined,
        [null, contracts.web3.utils.padLeft(id.toLowerCase(), 64)]
      )
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
  identities
}
