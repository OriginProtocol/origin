import contracts from '../contracts'
import stringify from 'json-stable-stringify'

export default function validateAttestation(accounts, attestation) {
  const web3 = contracts.web3
  const issuer = contracts.config.attestationIssuer.toLowerCase()
  if (issuer !== attestation.data.issuer.ethAddress.toLowerCase()) {
    console.log(
      `Attestation issuer address validation failure.
      Expected issuer ${issuer}, got ${attestation.data.issuer.ethAddress}`
    )
    return false
  }

  if (!Array.isArray(accounts)) accounts = [accounts]

  // Note: we use stringify rather than the default JSON.stringify
  // to produce a deterministic JSON representation of the data that was signed.
  // Similarly, we make sure to user checksummed eth address.
  const attestationJson = stringify(attestation.data)
  const errors = []

  // Check to see if any of the given accounts match the attestation. This lets
  // us support both proxies and owners.
  const result = accounts.some(account => {
    const message = web3.utils.soliditySha3(
      web3.utils.toChecksumAddress(account),
      web3.utils.sha3(attestationJson)
    )

    const signerAddress = web3.eth.accounts.recover(
      message,
      attestation.signature.bytes
    )
    if (signerAddress.toLowerCase() !== issuer) {
      errors.push(
        `Attestation signature validation failure.
        Account ${account}
        Expected issuer ${issuer}, got ${signerAddress}`
      )
      return false
    }
    return true
  })
  if (!result) {
    console.log(errors)
  }
  return result
}
