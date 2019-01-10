import { post } from 'origin-ipfs'
const emptyAddress = '0x0000000000000000000000000000000000000000'
import contracts from '../../contracts'

export default async function(profile, attestations) {
  const web3 = contracts.web3
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
    '0x' + attestations.map(({ signature }) => signature.substr(2)).join('')
  const claimData =
    '0x' + attestations.map(({ data }) => data.substr(2)).join('')
  const dataOffsets = attestations.map(({ data }) => (data.length - 2) / 2)

  return [topics, issuers, sigs, claimData, dataOffsets]
}
