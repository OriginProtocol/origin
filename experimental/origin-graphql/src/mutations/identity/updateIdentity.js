import ClaimHolderRegistered from 'origin-contracts/build/contracts/ClaimHolderRegistered'

import attestationArgs from './_attestationArgs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function updateIdentity(
  _,
  { from, identity, profile, attestations = [] }
) {
  await checkMetaMask(from)
  const web3 = contracts.web3Exec

  const contract = new web3.eth.Contract(ClaimHolderRegistered.abi, identity)
  const args = await attestationArgs(profile, attestations)
  const tx = contract.methods.addClaims(...args).send({ gas: 4612388, from })

  return txHelper({ tx, from, mutation: 'updateIdentity' })
}

export default updateIdentity
