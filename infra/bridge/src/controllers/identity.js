'use strict'

const express = require('express')
const get = require('lodash/get')

const router = express.Router()

const { identityReadVerify, identityWriteVerify } = require('../utils/validation')
const { loadIdentityAttestationsMetadata } = require('@origin/identity/utils')
const Identity = require('@origin/identity/src/models').Identity
const validator = require('@origin/validator')

const logger = require('../logger')
const { pinIdentityToIpfs, postToEmailWebhook } = require('../utils/identity')

/**
 * Loads the identity associated with an eth address.
 * Returns:
 *  - 200 if identity was found in the database.
 *  - 204 if no identity found.
 *  - 500 if identity row found but with empty data in the database.
 *
 *  @args {string} req.ethAddress Eth address of the user.
 *  @returns {{identity: Object, ipfsHash: string}}
 */
router.get('/', identityReadVerify, async (req, res) => {
  const ethAddress = req.query.ethAddress.toLowerCase()
  logger.debug(`identity/read called for addr ${ethAddress}`)

  // TODO: should we support lookups for both proxy and owner ???
  // Probably... ?
  // Lookup in proxy table ?

  // Lookup the identity associated with the eth address.
  const identity = await Identity.findOne({ where: { ethAddress } })

  /* FOR TESTING
  const identity = {
    data: {
      "schemaId":"https://schema.originprotocol.com/identity_1.0.0.json",
      "profile": {
        "firstName": "Francky" + Math.ceil(Math.random()*100),
        "lastName": "Baloboa",
        "description": "I'm a test account! I think?",
        "avatarUrl": "ipfs://QmWnTmoY6Pi5u3gxE9QSSFzw1MoCLgcd1Wg5mxTxzsL57c",
        "schemaId": "https://schema.originprotocol.com/profile_2.0.0.json",
        "ethAddress": ethAddress
      },
      "attestations": []
    }
  }
  */

  if (!identity || !identity.data) {
    logger.debug(`No identity found for eth address ${ethAddress}.`)
    return res.status(204).end()
  }

  // Check validity of the data before returning it.
  const errors = []
  for (const field of ['identity', 'ipfsHash', 'ipfsHashHistory']) {
    if (!get(identity.data, field)) {
      errors.push(`Identity ${ethAddress} is missing field data.${field}`)
    }
  }
  if (errors.length) {
    logger.error(errors)
    return res.status(500).send({ errors })
  }

  return res.status(200).send({
    identity: identity.data.identity,
    ipfsHash: identity.data.ipfsHash
  })
})

/**
 * Writes an identity to the database.
 *
 * @args {string} req.query.ethAddress: Eth address of the user.
 * @args {Object} req.body.identity: Identity JSON blob
 * @args {string} req.body.ipfsHash: IPFS hash of the identity JSON blob.
 */

// TODO:
//  [ ] authenticate user
//  [X] parse data
//  [X] store blob in identity.data
//  [X] store hash in identity.ipfsHash
//  [X] Query attestations to fill identity
//  [X] trigger pinning
//  [X] webhook for website mailing list

router.post('/', identityWriteVerify, async (req, res) => {
  const ethAddress = req.query.ethAddress.toLowerCase()
  const data = req.body || {}
  logger.debug(`identity/write called for addr ${ethAddress}`)
  if (!data.identity) {
    return res.status(400).send({ errors: ['Identity data missing'] })
  }
  if (!data.ipfsHash) {
    return res.status(400).send({ errors: ['IPFS hash missing'] })
  }

  // Parse the identity data to make sure it is valid.
  try {
    validator('https://schema.originprotocol.com/identity_1.0.0.json', data.identity)
    validator('https://schema.originprotocol.com/profile_2.0.0.json', data.identity.profile)
    data.identity.attestations.forEach(a => {
      validator('https://schema.originprotocol.com/attestation_1.0.0.json', a)
    })
  } catch(err) {
    logger.error(`Failed parsing identity data for ${ethAddress}`, err)
    return res.status(400).send({ errors: [`Failed parsing identity data: ${err}`] })
  }

  // Load attestation data from the DB.
  const metadata = loadIdentityAttestationsMetadata(ethAddress, data.identity.attestations)

  metadata.firstName = data.identity.profile.firstName
  metadata.lastName = data.identity.profile.lastName
  metadata.avatarUrl = data.identity.profile.avatarUrl

  // Lookup any existing identity associated with the eth address.
  const identity = await Identity.findOne({ where: { ethAddress } })
  if (identity) {
    logger.debug(`Updating identity DB row for ${ethAddress}`)
    // Append the old IPFS hash to the history.
    const ipfsHashHistory = get(identity, 'data.ipfsHashHistory', [])
    const prevIpfsHash = get(identity, 'data.ipfsHash', null)
    if (prevIpfsHash) {
      ipfsHashHistory.push({
        ipfsHash: prevIpfsHash,
        timestamp: identity.updatedAt.getTime()
      })
    }
    // Update the existing identity row.
    await identity.update({
      ...metadata,
      data: {
        identity: data.identity,
        ipfsHash: data.ipfsHash,
        ipfsHashHistory
      }
    })
  } else {
    // Create a new identity row.
    logger.debug(`Creating new identity DB row for ${ethAddress}`)
    await Identity.create({
      ethAddress,
      ...metadata,
      data: {
        identity: data.identity,
        ipfsHash: data.ipfsHash,
        ipfsHashHistory: []
      }
    })
  }

  // Pin the Identity data to the IPFS cluster.
  // TODO: check the the data format expected by the GCP cloud function
  await pinIdentityToIpfs(data.identity)

  // Call the webhook to record the user's email in the insight tool.
  await postToEmailWebhook()

  return res.status(200).send({ id: ethAddress })
})

module.exports = router