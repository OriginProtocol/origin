'use strict'

const Web3 = require('web3')
const Attestation = require('../models/index').Attestation
const AttestationTypes = Attestation.AttestationTypes
const constants = require('../constants')
const stringify = require('json-stable-stringify')
const { generateSignature } = require('./index.js')

const { redisClient, getAsync } = require('./redis')

const logger = require('../logger')

async function generateAttestation(
  attestationType,
  attestationBody,
  { uniqueId, profileUrl, username, profileData },
  ethAddress,
  remoteAddress
) {
  ethAddress = ethAddress.toLowerCase()

  const data = {
    issuer: constants.ISSUER,
    issueDate: new Date(),
    attestation: attestationBody
  }

  const signature = {
    bytes: generateAttestationSignature(
      process.env.ATTESTATION_SIGNING_KEY,
      ethAddress,
      // Use stringify rather than JSON.stringify to produce deterministic JSON
      // so the validation of the signature works.
      stringify(data)
    ),
    version: '1.0.0'
  }
  // Save the attestation in the database
  await Attestation.create({
    method: attestationType,
    ethAddress,
    value: uniqueId,
    signature: signature['bytes'],
    remoteIpAddress: remoteAddress,
    profileUrl,
    username,
    profileData
  })

  return {
    schemaId: 'https://schema.originprotocol.com/attestation_1.0.0.json',
    data: data,
    signature: signature
  }
}

function generateAttestationSignature(privateKey, subject, data) {
  const hashToSign = Web3.utils.soliditySha3(
    {
      t: 'address',
      v: Web3.utils.toChecksumAddress(subject)
    },
    {
      t: 'bytes32',
      v: Web3.utils.sha3(data)
    }
  )

  return generateSignature(privateKey, hashToSign)
}

const createTelegramAttestation = async ({
  message,
  identity
}) => {
  const redisKey = `telegram/attestation/${identity.toLowerCase()}`

  let data = await getAsync(redisKey)

  if (!data) {
    // Most likely, `/generate-code` was not invoked
    logger.error('Cannot find IP and Identity address in redis for Telegram Attestation')
    return
  }

  data = JSON.parse(data)
  const userIP = data.ip
  // const userIP = '127.0.0.1'

  const userProfileData = message.from
  const profileUrl = userProfileData.username
    ? `https://t.me/${userProfileData.username}`
    : null

  const attestationBody = {
    verificationMethod: {
      oAuth: true
    },
    site: {
      siteName: 'telegram.com',
      userId: {
        raw: String(userProfileData.id)
      },
      username: {
        raw: userProfileData.username
      },
      profileUrl: {
        raw: profileUrl
      }
    }
  }

  try {
    await generateAttestation(
      AttestationTypes.TELEGRAM,
      attestationBody,
      {
        uniqueId: userProfileData.id,
        username: userProfileData.username,
        profileUrl: profileUrl,
        profileData: userProfileData
      },
      Web3.utils.toChecksumAddress(identity),
      userIP
    )

    redisClient.del(redisKey)

    redisClient.setbit(redisKey + '/completed', 0, 1)

    return true
  } catch (error) {
    logger.error(error)
  }

  return false
}

module.exports = {
  generateAttestation,
  generateAttestationSignature,
  createTelegramAttestation
}
