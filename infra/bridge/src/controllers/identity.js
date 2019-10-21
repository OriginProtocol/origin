'use strict'

const express = require('express')
const get = require('lodash/get')

const router = express.Router()
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  loadIdentityAttestationsMetadata,
  loadIdentityAddresses,
  recordGrowthProfileEvent,
  recordGrowthAttestationEvents
} = require('@origin/identity/src/utils')
const Identity = require('@origin/identity/src/models').Identity
const validator = require('@origin/validator')

const {
  getOwnerAddress,
  pinIdentityToIpfs,
  postToEmailWebhook
} = require('../utils/identity')
const {
  identityReadVerify,
  identityWriteVerify
} = require('../utils/validation')

const logger = require('../logger')

/**
 * Loads the identity associated with an eth address.
 * Return status:
 *  - 200 if an identity was found in the database.
 *  - 204 if no identity found.
 *  - 500 if an identity row was found but with empty data in the database.
 *
 *  @args {string} req.ethAddress: Address of the user. Accepts either owner or proxy address.
 *  @returns {{identity: Object, ipfsHash: string}}
 */
router.get('/', identityReadVerify, async (req, res) => {
  const ethAddress = req.query.ethAddress
  logger.debug(`identity/read called for addr ${ethAddress}`)

  // In case the input address was a proxy, load the owner address.
  const owner = await getOwnerAddress(ethAddress)

  // Lookup the identity associated with the owner address.
  const identity = await Identity.findOne({ where: { ethAddress: owner } })

  if (!identity || !identity.data) {
    logger.debug(`No identity found for eth address ${owner}.`)
    return res.status(204).end()
  }

  // Check validity of the data before returning it.
  const errors = []
  for (const field of ['identity', 'ipfsHash', 'ipfsHashHistory']) {
    if (!get(identity.data, field)) {
      errors.push(`Identity ${owner} is missing field data.${field}`)
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
 * TODO(franck): Authenticate the request.
 *
 * @args {string} req.query.ethAddress: Address of the user. Accepts either owner or proxy address.
 * @args {Object} req.body.identity: Identity JSON blob.
 * @args {string} req.body.ipfsHash: IPFS hash of the identity JSON blob.
 * @returns {{id: string}} Returns the owner address used to write the identity to the DB.
 */
router.post('/', identityWriteVerify, async (req, res) => {
  const ethAddress = req.query.ethAddress
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
    validator(
      'https://schema.originprotocol.com/identity_1.0.0.json',
      data.identity
    )
    validator(
      'https://schema.originprotocol.com/profile_2.0.0.json',
      data.identity.profile
    )
    data.identity.attestations.forEach(a => {
      validator('https://schema.originprotocol.com/attestation_1.0.0.json', a)
    })
  } catch (err) {
    logger.error(`Failed parsing identity data for ${ethAddress}`, err)
    return res
      .status(400)
      .send({ errors: [`Failed parsing identity data: ${err}`] })
  }

  // Load attestation data from the DB.
  const addresses = loadIdentityAddresses(ethAddress)
  const metadata = loadIdentityAttestationsMetadata(
    addresses,
    data.identity.attestations
  )

  // In case the input address was a proxy, load the owner address.
  const owner = await getOwnerAddress(ethAddress)

  // Create an object representing the updated identity.
  // Note that by convention, the identity is stored under the owner's address in the DB.
  const identity = {
    ethAddress: owner,
    firstName: get(data.identity, 'profile.firstName'),
    lastName: get(data.identity, 'profile.lastName'),
    avatarUrl: get(data.identity, 'profile.avatarUrl'),
    data: {
      identity: data.identity,
      ipfsHash: data.ipfsHash,
      ipfsHashHistory: []
    },
    ...metadata
  }

  // Look for an existing identity to get the IPFS hash history.
  const identityRow = await Identity.findOne({ where: { ethAddress: owner } })
  if (identityRow) {
    logger.debug(`Found existing identity DB row for ${owner}`)
    // Append the old IPFS hash to the history.
    const ipfsHashHistory = get(identityRow, 'data.ipfsHashHistory', [])
    const prevIpfsHash = get(identityRow, 'data.ipfsHash')
    if (prevIpfsHash) {
      ipfsHashHistory.push({
        ipfsHash: prevIpfsHash,
        timestamp: identityRow.updatedAt.getTime()
      })
    }
    identity.data.ipfsHashHistory = ipfsHashHistory
  }

  // Update the identity in the DB.
  await Identity.upsert(identity)

  // Record the growth events.
  const now = new Date()
  await recordGrowthProfileEvent(owner, identity, now, GrowthEvent)
  await recordGrowthAttestationEvents(
    owner,
    data.identity.attestations,
    now,
    GrowthEvent
  )

  // Pin the Identity data to the IPFS cluster.
  await pinIdentityToIpfs(identity)

  // Call webhook to record the user's email in the insight tool.
  await postToEmailWebhook(identity)

  return res.status(200).send({ id: owner })
})

module.exports = router
