'use strict'

const express = require('express')
const get = require('lodash/get')

const router = express.Router()
const { GrowthEvent } = require('@origin/growth-event/src/resources/event')
const {
  loadAttestationMetadata,
  loadIdentityAddresses,
  recordGrowthAttestationEvents,
  recordGrowthProfileEvent,
  saveIdentity,
  validateIdentityIpfsData
} = require('@origin/identity/src/utils')
const Identity = require('@origin/identity/src/models').Identity

const {
  getOwnerAddress,
  pinIdentityToIpfs,
  postToEmailWebhook
} = require('../utils/identity')
const {
  identityListVerify,
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
 *  @returns {{ethAddress: string, identity: Object, ipfsHash: string}}
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
    ethAddress: identity.ethAddress,
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
 * @args {Object} req.body.ipfsData: Identity JSON blob store in IPFS
 * @args {string} req.body.ipfsHash: IPFS hash of the identity JSON blob.
 * @returns {{id: string}} Returns the owner address used to write the identity to the DB.
 */
router.post('/', identityWriteVerify, async (req, res) => {
  const ethAddress = req.query.ethAddress
  const data = req.body || {}
  logger.debug(`identity/write called for addr ${ethAddress}`)

  const ipfsData = data.ipfsData
  const ipfsHash = data.ipfsHash

  if (!ipfsData) {
    return res.status(400).send({ errors: ['Identity data missing'] })
  }
  if (!ipfsHash) {
    return res.status(400).send({ errors: ['IPFS hash missing'] })
  }

  // Parse the identity data to make sure it is valid.
  try {
    validateIdentityIpfsData(ipfsData)
  } catch (err) {
    logger.error(`Failed parsing identity data for ${ethAddress}`, err)
    return res
      .status(400)
      .send({ errors: [`Failed parsing identity data: ${err}`] })
  }

  // Load attestation data from the DB.
  const addresses = loadIdentityAddresses(ethAddress)
  const metadata = await loadAttestationMetadata(
    addresses,
    ipfsData.attestations
  )

  // In case the input address was a proxy, load the owner address.
  const owner = await getOwnerAddress(ethAddress)

  // Save the identity in the DB.
  const identity = await saveIdentity(owner, ipfsHash, ipfsData, metadata)

  // Record the growth events.
  const now = new Date()
  await recordGrowthProfileEvent(owner, identity, now, GrowthEvent)
  await recordGrowthAttestationEvents(
    owner,
    ipfsData.attestations,
    now,
    GrowthEvent
  )

  // Pin the Identity data to the IPFS cluster.
  await pinIdentityToIpfs(identity)

  // Call webhook to record the user's email in the insight tool.
  await postToEmailWebhook(identity)

  return res.status(200).send({ ethAddress: owner })
})

/**
 * Returns a list of identities.
 **
 * @args {string} req.query.limit: Max number of identities to return.
 * @args {Integer} req.body.offset: Offset
 * @returns {{identities: Array<Object>, totalCount: Integer}} List of identities and total number of identities.
 */
router.get('/list', identityListVerify, async (req, res) => {
  const limit = req.query.limit
  const offset = req.query.offset
  logger.debug(`identity/list called limit=${limit} offset=${offset}`)

  const rows = await Identity.findAll({ limit, offset })
  const totalCount = await Identity.count()
  const identities = rows.map(row => {
    return {
      ethAddress: row.ethAddress,
      identity: get(row, 'data.identity'),
      ipfsHash: get(row, 'data.ipfsHash')
    }
  })

  return res.status(200).send({ identities, totalCount })
})

module.exports = router
