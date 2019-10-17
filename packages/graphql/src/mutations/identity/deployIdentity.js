import createDebug from 'debug'
import get from 'lodash/get'
import pick from 'lodash/pick'
import pickBy from 'lodash/pickBy'

import { post } from '@origin/ipfs'
import validator from '@origin/validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import validateAttestation from '../../utils/validateAttestation'
import { getProxyAndOwner, resetProxyCache } from '../../utils/proxy'
import remoteQuery, { identityQuery } from '../../utils/remoteQuery'
import costs from '../_gasCost.js'

import { identity } from './../../resolvers/IdentityEvents'

const debug = createDebug('origin:identity:write')


const deduplicateAttestations = attestations => {
  // Note: sortAttestations() method under `packages/graphql/src/resolvers/IdentityEvent.js`
  // will filter out multiple attestations for same provider

  return Array.from(new Set(attestations))
}

const mapAttestations = (attestations, accounts) => {
  return (
    deduplicateAttestations(attestations)
      .map(attestation => {
        try {
          return {
            ...JSON.parse(attestation),
            schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json'
          }
        } catch (e) {
          console.error('Error parsing attestation', attestation)
          return null
        }
      })
      // TODO: Instead of silently filtering out invalid attestations,
      // we should notify user about this
      .filter(a => validateAttestation(accounts, a))
  )
}

/**
 * Returns an identity object by merging the existing user's identity
 * with updated profile and attestations data supplied by the DApp.
 *
 * @param {string} owner: eth address for the owner
 * @param {string||null} proxy: eth address for the proxy or null if no proxy associated with the owner.
 * @param {Object} profile: user profile data from the DApp.
 * @param {Array<Object>} attestations: list of updated attestations from the DApp.
 * @returns {Promise<{schemaId: string, profile: *, attestations: *}>}
 * @private
 */
async function _buildIdentity(owner, proxy, profile, attestations) {
  const accounts = [owner, proxy].filter(x => x)

  attestations = mapAttestations(attestations, accounts)

  // Note: DApp will send only the unpublished data
  // Merge that with already published identity, if it exists
  let oldIdentity
  if (
    typeof window !== 'undefined' &&
    contracts.config.performanceMode &&
    context.config.graphql
  ) {
    // Use remote server for performance when we can
    try {
      const result = await remoteQuery(identityQuery, 'SkinnyIdentity', {
        id: owner
      })
      oldIdentity = get(result, 'data.identity')
    } catch (err) {
      console.error('Unable to remotely fetch identity')
      console.error(err)
      // Fallback to internal resolver
      oldIdentity = await identity({ id: owner })
    }
  } else {
    // Use internal resolver (leverages EventCache)
    oldIdentity = await identity({ id: owner })
  }
  if (oldIdentity) {
    // Upsert
    profile = {
      ...pickBy(
        pick(oldIdentity, [
          'firstName',
          'lastName',
          'description',
          'avatarUrl'
        ]),
        field => typeof field === 'string'
      ),
      ...profile
    }

    attestations = [
      ...mapAttestations(oldIdentity.attestations, accounts),
      ...attestations
    ]
  }

  profile.schemaId = 'https://schema.originprotocol.com/profile_2.0.0.json'
  profile.ethAddress = owner

  const data = {
    schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
    profile,
    attestations
  }

  validator('https://schema.originprotocol.com/identity_1.0.0.json', data)
  validator('https://schema.originprotocol.com/profile_2.0.0.json', profile)
  attestations.forEach(a => {
    validator('https://schema.originprotocol.com/attestation_1.0.0.json', a)
  })

  return data
}

/**
 * Saves a user identity.
 * The data is either stored on the blockchain or in centralized storage,
 * based on the "centralizedIdentityEnabled" config option.
 *
 * @param from
 * @param profile
 * @param attestations
 * @returns {Promise<{id: hash}>} // Returns the tx hash
 */
async function deployIdentity(
  _,
  { from = contracts.defaultMobileAccount, profile, attestations }
) {
  debug('In deployIdentity ')
  await checkMetaMask(from)

  // DEPRECATE ????
  //const proxy = await hasProxy(from)
  //const owner = !proxy ? await proxyOwner(from) : null
  //const wallet = proxy || from
  //const accounts = owner ? [wallet, owner] : [wallet]

  // Get owner and proxy address.
  const { owner, proxy } = await getProxyAndOwner(from)

  // Create the identity data.
  const identity = await _buildIdentity(owner, proxy, profile, attestations)

  // Write the identity data to IPFS.
  const ipfsHash = await post(contracts.ipfsRPC, identity)

  debug('contracts.config.centralizedIdentityEnabled=', contracts.config.centralizedIdentityEnabled)
  if (true) {
  //if (contracts.config.centralizedIdentityEnabled) {
    // Write the identity data to centralized storage via the bridge server.
    console.log('WRITING IDENTITY !!!!!!')
    const bridgeServer = contracts.config.bridge
    if (!bridgeServer) {
      throw new Error('Bridge server not configured')
    }
    const url = `${bridgeServer}/api/identity?ethAddress=${from}`

    console.log(`Sending query ${url}`)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ identity, ipfsHash })
    })
    if (response.status !== 200) {
      throw new Error(`Bridge write for identity ${from} failed`)
    }
    const data = await response.json()
    console.log('GOT RESPONSE !!! ID=', data.id)
    return { id: data.id }
  } else {
    // Write the identity data to the blockchain via the IdentityEvents contract.
    return txHelper({
      tx: contracts.identityEventsExec.methods.emitIdentityUpdated(ipfsHash),
      from,
      mutation: 'deployIdentity',
      gas: costs.emitIdentityUpdated,
      onConfirmation: () => resetProxyCache()
    })
  }
}

export default deployIdentity
