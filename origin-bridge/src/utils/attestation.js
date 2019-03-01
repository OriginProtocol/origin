'use strict'

const eth = require('web3-eth')
const Web3 = require('web3')
const web3 = new Web3(process.env.PROVIDER_URL || 'http://localhost:8545')
const Attestation = require('../models/index').Attestation
const constants = require('../constants')

async function generateAttestation(
  attestationType,
  attestationBody,
  attestationValue,
  ethAddress,
  remoteAddress
) {
  const data = {
    issuer: constants.ISSUER,
    issueDate: new Date(),
    attestation: attestationBody
  }

  // TODO: verify determinism of JSONifying data for hashing

  const signature = {
    bytes: generateAttestationSignature(
      process.env.ATTESTATION_SIGNING_KEY,
      ethAddress,
      JSON.stringify(data)
    ),
    version: '1.0.0'
  }

  // Save the attestation in the database
  await Attestation.create({
    method: attestationType,
    ethAddress: ethAddress,
    value: attestationValue,
    signature: signature['bytes'],
    remoteIpAddress: remoteAddress
  })

  return {
    schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
    data: data,
    signature: signature
  }
}

function generateAttestationSignature(privateKey, subject, data) {
  if (!web3.utils.isHexStrict(privateKey)) {
    throw 'Invalid private key, not a hex string'
  }
  const hashToSign = web3.utils.soliditySha3(
    {
      t: 'address',
      v: web3.utils.toChecksumAddress(subject)
    },
    {
      t: 'bytes32',
      v: web3.utils.sha3(data)
    }
  )
  const signedMessage = new eth().accounts.sign(hashToSign, privateKey)
  return signedMessage.signature
}

module.exports = {
  generateAttestation,
  generateAttestationSignature
}
