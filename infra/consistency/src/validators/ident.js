const esmImport = require('esm')(module)
const { find, get } = esmImport('lodash')
const ipfs = esmImport('@origin/ipfs')
const db = {
  ...require('@origin/identity/src/models')
}

const { log } = require('../logger')

const { assert, getListenerBlock, getPastEvents } = require('./utils')

const ATTESTATION_TYPES = [
  'sms',
  'phone',
  //'oAuth', // Not in DB?
  'email',
  'twitter',
  'airbnb',
  'facebook',
  'google',
  'website'
]
const ATTESTATION_TYPE_MAP_DB = {
  sms: 'phone', // TODO: Doesn't exist in db, is phone equivalent?
  phone: 'phone',
  email: 'email',
  twitter: 'twitter',
  airbnb: 'airbnb',
  facebookVerified: 'facebookVerified',
  googleVerified: 'googleVerified',
  website: 'website',
  facebook: 'facebook',
  google: 'google',
  kakao: 'kakao',
  github: 'github',
  linkedin: 'linkedin',
  wechat: 'wechat'
}

/**
 * Get the attestation object from the JSON object
 */
function getAttestation(attestationArray, name) {
  const path = `data.attestation.verificationMethod.${name}`
  return find(attestationArray, o => {
    if (get(o, path)) {
      return o
    }
  })
}

/**
 * Get the DB equivalent value for an attestation
 */
function getAttestationDBRepr(attestationDBRecord, name) {
  if (name === 'facebook' || name === 'google') {
    // For backward comptability
    // If userId is not stored in the database, return boolean value from the DB
    if (!attestationDBRecord[ATTESTATION_TYPE_MAP_DB[name]]) {
      return attestationDBRecord[ATTESTATION_TYPE_MAP_DB[`${name}Verified`]]
    }
  }
  return attestationDBRecord[ATTESTATION_TYPE_MAP_DB[name]]
}

/**
 * Compare the provided JSON to the provided database record
 */
function validateIPFSToDB(ipfsJson, dbRecord) {
  // TODO: IPFS hash column should be added to table and verified here

  assert(ipfsJson.profile, 'Profile missing in JSON')
  assert(ipfsJson.attestations, 'Attestations missing in JSON')

  const { profile, attestations } = ipfsJson

  // Check profile details
  assert(
    profile.firstName == dbRecord.firstName,
    `Unexpected firstName ${profile.firstName} != ${dbRecord.firstName}`
  )
  assert(
    profile.lastName == dbRecord.lastName,
    `Unexpected lastName  ${profile.lastName} != ${dbRecord.lastName}`
  )
  assert(
    profile.ethAddress.toLowerCase() == dbRecord.ethAddress,
    `Unexpected ethAddress. ${profile.ethAddress} != ${dbRecord.ethAddress}`
  )

  // Check attestations
  for (const attName of ATTESTATION_TYPES) {
    const attObj = getAttestation(attestations, attName)
    const attestationValueJSON = get(
      attObj,
      `data.attestation.${attName}.verified`
    )
    const attestationValueDB = getAttestationDBRepr(dbRecord, attName)

    if (typeof attestationValueJSON === 'undefined') {
      /**
       * null from DB, undefined from _.get.  Also, this may be false positive
       * when things like 'sms' and 'phone' are analogous
       */
      if (
        attestationValueDB !== null &&
        ['sms', 'phone'].indexOf(attName) < 0
      ) {
        assert(
          attestationValueDB !== null,
          `DB record value for ${attName} attestation should be null if it isn't included`
        )
      }
    } else {
      assert(
        attestationValueJSON === true,
        `Attestation "verified" should be true or not present`
      )

      // We can't really verify the values, but we can make sure they exist
      switch (attName) {
        case 'facebook':
        case 'google':
          assert(
            attestationValueDB,
            `DB Value should be true for ${attName} attestation`
          )
          break
        case 'sms':
        case 'email':
        case 'phone':
        case 'twitter':
        case 'airbnb':
        case 'website':
        default:
          assert(
            attestationValueDB !== null,
            'DB Value should be non-null if attested'
          )
      }
    }
  }
}

/**
 * Verify an identity is what's expected between the IPFS record and database
 */
async function verifyIdent(address, ipfsGateway, ipfsHash) {
  address = address.toLowerCase()

  const records = await db.Identity.findAll({
    where: {
      eth_address: address
    }
  })

  // Make sure we have the expected amount of records
  if (records.length < 1) {
    log.error(`Did not find a matching record for address ${address}`)
    return false
  } else if (records.length > 1) {
    log.warn(`Found too many records for address ${address}`)
    return false
  }

  // Fetch the IPFS data
  let qmHash, ipfsJson
  try {
    qmHash = ipfs.getIpfsHashFromBytes32(ipfsHash)
    ipfsJson = await ipfs.get(ipfsGateway, qmHash)
  } catch (err) {
    log.error(`Error retrieving IPFS data for ${qmHash}`)
    log.error(err)
  }

  log.debug(`Comparing IPFS Identity ${address} - ${qmHash}`)

  if (!ipfsJson) {
    log.error(`IPFS Data missing at ${ipfsGateway}/${qmHash}`)
    return false
  }

  // Make sure the record is sane
  try {
    validateIPFSToDB(ipfsJson, records[0])
  } catch (err) {
    // Handle Assertion errors
    if (err.name === 'AssertionError') {
      log.error(`Identity validation failed  for ${address}: ${err.toString()}`)
      return false
    } else {
      throw err
    }
  }
  return true
}

/**
 * Validate that all idents are what is expected
 */
async function validateIdentities({
  contractsContext,
  fromBlock = 0,
  toBlock = 'latest',
  ipfsGateway = 'https://ipfs.originprotocol.com'
}) {
  const identityEvents = contractsContext.identityEvents
  const identities = {}

  // Only fetch up to where the listener is reported to be at, don't get ahead
  // of it
  if (toBlock === 'latest') {
    toBlock = await getListenerBlock('main', 'IdentityEvents_')
  }

  const events = await getPastEvents(identityEvents, 'allEvents', {
    fromBlock,
    toBlock
  })

  assert(events.length > 0, 'No events to check')

  // Build up an object with the expected IPFS hash for each ident
  let lastBlock = 0
  for (const event of events) {
    assert(event.blockNumber >= lastBlock, 'Events out of order!')

    if (event.event == 'IdentityUpdated') {
      identities[event.returnValues.account] = event.returnValues.ipfsHash
    } else if (event.event == 'IdentityDeleted') {
      delete identities[event.returnValues.account]
    }

    lastBlock = event.blockNumber
  }

  // Verify the IPFS data against the IPFS table
  for (const address of Object.keys(identities)) {
    const verified = await verifyIdent(
      address,
      ipfsGateway,
      identities[address]
    )

    if (!verified) {
      log.info(`Identity verification for account ${address} failed.`)
    }
  }
}

module.exports = {
  validateIdentities
}
