import { post } from 'origin-ipfs'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'
import costs from '../_gasCost.js'

async function deployIdentity(_, { from, profile = {}, attestations = [] }) {
  await checkMetaMask(from)

  attestations = attestations
    .map(a => {
      try {
        return JSON.parse(a)
      } catch (e) {
        return null
      }
    })
    .filter(a => a)

  profile.ethAddress = from
  const data = {
    schemaId: 'https://schema.originprotocol.com/identity_1.0.0.json',
    profile,
    attestations
  }
  const ipfsHash = await post(contracts.ipfsRPC, data)

  const tx = contracts.identityEventsExec.methods
    .emitIdentityUpdated(ipfsHash)
    .send({ gas: costs.emitIdentityUpdated, from })
  return txHelper({ tx, from, mutation: 'deployIdentity' })
}

export default deployIdentity
