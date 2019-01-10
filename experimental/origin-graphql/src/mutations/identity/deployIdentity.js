import ClaimHolderPresigned from 'origin-contracts/build/contracts/ClaimHolderPresigned'

import attestationArgs from './_attestationArgs'
import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

async function deployIdentity(_, { from, profile, attestations = [] }) {
  await checkMetaMask(from)
  const web3 = contracts.web3Exec

  const attArgs = await attestationArgs(profile, attestations)
  const args = [window.localStorage.userRegistryContract, ...attArgs]

  const Contract = new web3.eth.Contract(ClaimHolderPresigned.abi)
  const tx = Contract.deploy({ data: getLinkedData(), arguments: args }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    mutation: 'deployIdentity',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
    }
  })
}

function getLinkedData() {
  let data = ClaimHolderPresigned.bytecode
  if (!window.localStorage.KeyHolderLibrary) {
    throw 'Could not link KeyHolderLibrary'
  }
  if (!window.localStorage.ClaimHolderLibrary) {
    throw 'Could not link ClaimHolderLibrary'
  }
  if (!window.localStorage.userRegistryContract) {
    throw 'No UserRegistry'
  }
  data = data
    .replace(
      /__KeyHolderLibrary______________________/g,
      window.localStorage.KeyHolderLibrary.slice(2)
    )
    .replace(
      /__ClaimHolderLibrary____________________/g,
      window.localStorage.ClaimHolderLibrary.slice(2)
    )
  return data
}

export default deployIdentity
