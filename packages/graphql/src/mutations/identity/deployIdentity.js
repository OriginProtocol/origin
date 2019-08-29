import { post } from '@origin/ipfs'
import validator from '@origin/validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import validateAttestation from '../../utils/validateAttestation'
import { hasProxy, proxyOwner, resetProxyCache } from '../../utils/proxy'
import costs from '../_gasCost.js'

import pick from 'lodash/pick'

import { identity } from './../../resolvers/IdentityEvents'

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
          console.log('Error parsing attestation', attestation)
          return null
        }
      })
      // TODO: Instead of silently filtering out invalid attestations,
      // we should notify user about this
      .filter(a => validateAttestation(accounts, a))
  )
}

async function deployIdentity(
  _,
  { from = contracts.defaultMobileAccount, profile, attestations }
) {
  await checkMetaMask(from)

  const proxy = await hasProxy(from)
  const owner = !proxy ? await proxyOwner(from) : null
  const wallet = proxy || from
  const accounts = owner ? [wallet, owner] : [wallet]

  attestations = mapAttestations(attestations, accounts)

  // Note: DApp will send only the unpublished data
  // Merge that with already published identity, if it exists
  const oldIdentity = await identity({ id: from })
  if (oldIdentity) {
    // Upsert
    profile = {
      ...pick(oldIdentity, [
        'firstName',
        'lastName',
        'description',
        'avatarUrl'
      ]),
      ...profile
    }

    attestations = [
      ...mapAttestations(oldIdentity.attestations, accounts),
      ...attestations
    ]
  }

  profile.schemaId = 'https://schema.originprotocol.com/profile_2.0.0.json'
  profile.ethAddress = wallet

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

  const ipfsHash = await post(contracts.ipfsRPC, data)

  return txHelper({
    tx: contracts.identityEventsExec.methods.emitIdentityUpdated(ipfsHash),
    from,
    mutation: 'deployIdentity',
    gas: costs.emitIdentityUpdated,
    onConfirmation: () => resetProxyCache()
  })
}

export default deployIdentity
