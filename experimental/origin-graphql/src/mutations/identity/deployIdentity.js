import { post } from 'origin-ipfs'
import ClaimHolderPresigned from 'origin-contracts/build/contracts/ClaimHolderPresigned'

import txHelper, { checkMetaMask } from '../_txHelper'
import contracts from '../../contracts'

const emptyAddress = '0x0000000000000000000000000000000000000000'

async function deployIdentity(_, { from, profile, attestations = [] }) {
  const web3 = contracts.web3Exec
  await checkMetaMask(from)
  const Contract = new web3.eth.Contract(ClaimHolderPresigned.abi)
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

  if (profile) {
    const ipfsHash = await post(contracts.ipfsRPC, profile)
    attestations.push({
      topic: 13, // Self attestation
      issuer: web3.utils.padRight('0x', 40),
      data: ipfsHash,
      signature: web3.utils.padRight('0x', 130)
    })
  }

  const topics = attestations.map(({ topic }) => topic)
  const issuers = attestations.map(({ issuer }) => issuer || emptyAddress)
  const sigs =
    '0x' +
    attestations
      .map(({ signature }) => {
        return signature.substr(2)
      })
      .join('')

  const claimData =
    '0x' + attestations.map(({ data }) => data.substr(2)).join('')
  const dataOffsets = attestations.map(({ data }) => (data.length - 2) / 2)

  const args = [
    window.localStorage.userRegistryContract,
    topics,
    issuers,
    sigs,
    claimData,
    dataOffsets
  ]

  const tx = Contract.deploy({ data, arguments: args }).send({
    gas: 5500000,
    from
  })

  return txHelper({
    tx,
    mutation: 'deployIdentity',
    onReceipt: receipt => {
      Contract.options.address = receipt.contractAddress
      console.log('Identity at ', receipt.contractAddress)
    }
  })
}

export default deployIdentity
