import contracts from '../contracts'
import stringify from 'json-stable-stringify'

export default function validateAttestation(account, attestation) {
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
