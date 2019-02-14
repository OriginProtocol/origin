import { post } from 'origin-ipfs'
import validator from 'origin-validator'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import validateAttestation from '../../utils/validateAttestation'
import costs from '../_gasCost.js'

async function deployIdentity(
  _,
  { from = contracts.defaultLinkerAccount, profile = {}, attestations = [] }
) {
  console.log('deployIdentity:', from)
  await checkMetaMask(from)

  attestations = attestations
    .map(a => {
      try {
        return {
          ...JSON.parse(a),
          schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json'
        }
      } catch (e) {
        console.log('Error parsing attestation', a)
        return null
      }
    })
    .filter(a => validateAttestation(from, a))

  profile.schemaId = 'https://schema.originprotocol.com/profile_2.0.0.json'
  profile.ethAddress = from

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
  const tx = contracts.identityEventsExec.methods
    .emitIdentityUpdated(ipfsHash)
    .send({ gas: costs.emitIdentityUpdated, from })

  return txHelper({ tx, from, mutation: 'deployIdentity' })
}

export default deployIdentity
