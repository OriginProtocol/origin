const Sequelize = require('sequelize')
const get = require('lodash/get')
const isEqual = require('lodash/isEqual')
const pick = require('lodash/pick')
const uniqWith = require('lodash/uniqWith')

const db = {
  ...require('@origin/growth-event/src/models'),
  ...require('./models')
}
const originIpfs = require('@origin/ipfs')
const { ip2geo } = require('@origin/ip2geo')
const validator = require('@origin/validator')

const logger = require('./logger')

const siteNameToService = {
  'airbnb.com': 'airbnb',
  'facebook.com': 'facebook',
  'github.com': 'github',
  'google.com': 'google',
  'kakao.com': 'kakao',
  'linkedin.com': 'linkedin',
  'twitter.com': 'twitter',
  'wechat.com': 'wechat',
  'telegram.com': 'telegram'
}

/**
 * Some legacy identities were storing the avatar picture as data URI in the
 * profile data. This methods extracts the picture, uploads it to IPFS and
 * modifies the identity so that it contains the IPFS hash of the picture
 * rather than the binary picture data. In case of an error during the conversion,
 * the binary data is stripped from the identity and the error is logged but not returned.
 *
 * @param {string} ipfsGateway: URL of the IPFS gateway to use.
 * @param {Object} identity: JSON blob of the identity fetched from IPFS.
 * @returns {Promise<void>}
 */
async function convertLegacyAvatar(ipfsGateway, identity) {
  const profile = identity.profile
  if (!profile || !profile.avatar || !profile.avatar.length) {
    logger.debug('No legacy avatar conversion needed.')
    return
  }
  try {
    // Extract the binary data from the data URI.
    const parts = profile.avatar.split(',')
    const avatarBinary = Buffer.from(parts[1], 'base64')
    // Upload the binary data to IPFS.
    const avatarHash = await originIpfs.postBinary(ipfsGateway, avatarBinary)
    profile.avatarUrl = 'ipfs://' + avatarHash
    logger.debug(`Legacy avatar conversion successful. Hash: ${avatarHash}`)
  } catch (err) {
    logger.warn('Failed to convert legacy avatar:', err)
  }
  delete profile.avatar
}

/**
 * Returns the name of the service associated with an attestation.
 *
 * @param {Object} attestation
 * @returns {string|undefined}
 * @private
 */
function _getAttestationService(attestation) {
  if (attestation.data.attestation.site) {
    const siteName = attestation.data.attestation.site.siteName
    const service = siteNameToService[siteName]
    if (!service) {
      logger.error(`Unexpected siteName for attestation ${attestation}`)
    }
    return service
  } else if (attestation.data.attestation.phone) {
    return 'phone'
  } else if (attestation.data.attestation.email) {
    return 'email'
  } else if (attestation.data.attestation.domain) {
    return 'website'
  } else {
    logger.error(`Failed extracting service from attestation ${attestation}`)
  }
}

/**
 * Loads the most recent attestation.
 *
 * @param {Array<string>} addresses: Lower cased eth addresses
 * @param {string || null} method: Optional attestation method
 * @returns {Promise<Model<Attestation> || null>}
 * @private
 */
async function _loadMostRecentAttestation(addresses, method) {
  const where = { ethAddress: { [Sequelize.Op.in]: addresses } }
  if (method) {
    where.method = method
  }
  return db.Attestation.findOne({ where, order: [['id', 'DESC']] })
}

/**
 * Loads attestation data such as email, phone, etc... from the attestation table.
 *
 * @param {Array<string>} addresses
 * @param {string} method - 'EMAIL', 'PHONE', etc...
 * @returns {Promise<string|null>}
 * @private
 */
async function _loadValueFromAttestation(addresses, method) {
  // Loads the most recent value.
  const attestation = await _loadMostRecentAttestation(addresses, method)
  if (!attestation) {
    logger.warn(`Could not find ${method} attestation for ${addresses}`)
    return null
  }
  return attestation.value
}

/**
 * Returns the country of the identity based on IP from the most recent attestation.
 *
 * @param {Array<string>} addresses
 * @returns {Promise<string> || null} 2 letters country code or null if lookup failed.
 * @private
 */
async function _countryLookup(addresses) {
  // Load the most recent attestation.
  const attestation = await _loadMostRecentAttestation(addresses, null)
  if (!attestation) {
    return null
  }

  // Do the IP to geo lookup.
  const geo = await ip2geo(attestation.remoteIpAddress)
  if (!geo) {
    return null
  }
  return geo.countryCode
}

/**
 * Loads proxy address(es) (if any) associated with an owner address.
 *
 * @param ownerAddress
 * @returns {Promise<Array<string>>} Lower cased addresses, incuding owner and proxy(ies).
 */
async function loadIdentityAddresses(ownerAddress) {
  // Attestation rows in the DB may have been written under the
  // proxy eth address. Load proxy addresses.
  const addresses = [ownerAddress.toLowerCase()]
  const proxies = await db.Proxy.findAll({ where: { ownerAddress } })
  for (const proxy of proxies) {
    addresses.push(proxy.address)
  }
  return addresses
}

/**
 * Reads metadata related to attestations from the DB.
 *
 * @param {Array<string>} addresses: owner and optionally proxy eth address.
 * @param {Array<Object>} attestations: attestations present in the user's identity.
 * @returns {Promise<Object>}
 */
async function loadAttestationMetadata(addresses, attestations) {
  const metadata = {}

  // Load attestation data.
  await Promise.all(
    attestations.map(async attestation => {
      const attestationService = _getAttestationService(attestation)
      switch (attestationService) {
        case 'email':
          metadata.email = await _loadValueFromAttestation(addresses, 'EMAIL')
          break
        case 'phone':
          metadata.phone = await _loadValueFromAttestation(addresses, 'PHONE')
          break
        case 'twitter': {
          const attestation = await _loadMostRecentAttestation(
            addresses,
            'TWITTER'
          )
          if (attestation) {
            metadata.twitter = attestation.value
            metadata.twitterProfile = attestation.profileData
          } else {
            logger.warn(`Could not find TWITTER attestation for ${addresses}`)
            metadata.twitter = null
            metadata.twitterProfile = null
          }
          break
        }
        case 'airbnb':
          metadata.airbnb = await _loadValueFromAttestation(addresses, 'AIRBNB')
          break
        case 'facebook':
          metadata.facebookVerified = true
          metadata.facebook = await _loadValueFromAttestation(
            addresses,
            'FACEBOOK'
          )
          break
        case 'google':
          metadata.googleVerified = true
          metadata.google = await _loadValueFromAttestation(addresses, 'GOOGLE')
          break
        case 'linkedin':
          metadata.linkedin = await _loadValueFromAttestation(
            addresses,
            'LINKEDIN'
          )
          break
        case 'github':
          metadata.github = await _loadValueFromAttestation(addresses, 'GITHUB')
          break
        case 'kakao':
          metadata.kakao = await _loadValueFromAttestation(addresses, 'KAKAO')
          break
        case 'wechat':
          metadata.wechat = await _loadValueFromAttestation(addresses, 'WECHAT')
          break
        case 'website':
          metadata.website = await _loadValueFromAttestation(
            addresses,
            'WEBSITE'
          )
          break
        case 'telegram': {
          const attestation = await _loadMostRecentAttestation(
            addresses,
            'TELEGRAM'
          )
          if (attestation) {
            metadata.telegram = attestation.value
            metadata.telegramProfile = attestation.profileData
          } else {
            logger.warn(`Could not find TELEGRAM attestation for ${addresses}`)
            metadata.telegram = null
            metadata.telegramProfile = null
          }
          break
        }
      }
    })
  )

  // Add country of origin based on IP.
  metadata.country = await _countryLookup(addresses)

  return metadata
}

/**
 * Validates identity data stored in IPFS by checking against JSON schemas.
 * Throws in case of a validation error.
 *
 * @param {Object} ipfsData: JSON parsed identity data stored on IPFS.
 */
function validateIdentityIpfsData(ipfsData) {
  validator('https://schema.originprotocol.com/identity_1.0.0.json', ipfsData)
  validator(
    'https://schema.originprotocol.com/profile_2.0.0.json',
    ipfsData.profile
  )
  ipfsData.attestations.forEach(a => {
    validator('https://schema.originprotocol.com/attestation_1.0.0.json', a)
  })
}

/**
 * Saves an identity in the DB.
 *
 * @param {string} owner: Eth address of the user
 * @param {string} ipfsHash: IPFS hash of the identity blob.
 * @param {Object} ipfsData: JSON parsed identity blob stored in IPFS.
 * @param {Object} attestationMetadata: Attestation specific metadata loaded from the DB.
 * @returns {Promise<{firstName: *, lastName: *, data: {identity: *, ipfsHash: *, ipfsHashHistory: []}, avatarUrl: *, ethAddress: *}>}
 */
async function saveIdentity(owner, ipfsHash, ipfsData, attestationMetadata) {
  // Create an object representing the updated identity.
  // Note: by convention, the identity is stored under the owner's address in the DB.
  // TODO(franck): consider blacklisting twitterProfile and telegramProfile to
  //               reduce the amount of data stored in the data column.
  const identityFields = [
    'email',
    'phone',
    'twitter',
    'airbnb',
    'facebook',
    'facebook_verified',
    'google',
    'google_verified',
    'website',
    'kakao',
    'github',
    'linkedin',
    'wechat',
    'telegram',
    'country'
  ]
  const dataFields = ['twitterProfile', 'telegramProfile']
  const identity = {
    ethAddress: owner.toLowerCase(),
    firstName: get(ipfsData, 'profile.firstName'),
    lastName: get(ipfsData, 'profile.lastName'),
    avatarUrl: get(ipfsData, 'profile.avatarUrl'),
    data: {
      identity: ipfsData,
      ipfsHash: ipfsHash,
      ipfsHashHistory: [],
      ...pick(attestationMetadata, dataFields)
    },
    ...pick(attestationMetadata, identityFields)
  }

  // Look for an existing identity to get the IPFS hash history.
  const identityRow = await db.Identity.findOne({
    where: { ethAddress: owner.toLowerCase() }
  })
  if (identityRow) {
    logger.debug(`Found existing identity DB row for ${owner}`)
    // Append the old IPFS hash to the history, handling the possibility
    // we may be reprocessing data (ex: in the case of a listener backfill).
    let ipfsHashHistory = get(identityRow, 'data.ipfsHashHistory', [])
    const prevIpfsHash = get(identityRow, 'data.ipfsHash')
    if (prevIpfsHash && prevIpfsHash !== ipfsHash) {
      ipfsHashHistory.push({
        ipfsHash: prevIpfsHash,
        timestamp: identityRow.updatedAt.getTime()
      })
      // Dedupe.
      ipfsHashHistory = uniqWith(ipfsHashHistory, isEqual)
    }
    identity.data.ipfsHashHistory = ipfsHashHistory
  }

  // Persist the identity in the DB.
  await db.Identity.upsert(identity)

  return identity
}

/**
 * Records a ProfilePublished event in the growth_event table
 * at the condition that the identity has a first name and last name.
 *
 * @param {Object} user: Origin js user model object.
 * @param {Date} date: Event date.
 * @param {Object} growthEvent: See infra/growth-event/src/resources/GrowthEvent
 * @returns {Promise<void>}
 * @private
 */
async function recordGrowthProfileEvent(
  ethAddress,
  identity,
  date,
  growthEvent
) {
  const validFirstName = identity.firstName && identity.firstName.length > 0
  const validLastName = identity.lastName && identity.lastName.length > 0

  const validProfile = validFirstName && validLastName
  if (!validProfile) {
    return
  }

  await growthEvent.insert(
    logger,
    1,
    ethAddress,
    growthEvent.Types.ProfilePublished,
    null,
    null,
    date
  )
}

/**
 * Records AttestationPublished events in the growth_event table.
 * @param {Object} attestations
 * @param {Date} date: Event date.
 * @param {Object} growthEvent: See infra/growth-event/src/resources/GrowthEvent
 * @returns {Promise<void>}
 * @private
 */
async function recordGrowthAttestationEvents(
  ethAddress,
  attestations,
  date,
  growthEvent
) {
  // Note: this could be optimized by inserting events in parallel rather
  // than serially. A caveat is that the identity data structure may contain
  // multiple attestations of the same type. For example if a user verifies
  // their email more than once. This could then cause a race condition within
  // the growthEvent.insert() method where the checks for ensuring there is
  // one growth-event row per attestation type can fail.
  for (const attestation of attestations) {
    const attestationService = _getAttestationService(attestation)
    const eventType =
      growthEvent.AttestationServiceToEventType[attestationService]
    if (!eventType) {
      logger.error(`Skipping unexpected service: ${attestationService}.`)
      continue
    }

    await growthEvent.insert(logger, 1, ethAddress, eventType, null, null, date)
  }
}

module.exports = {
  convertLegacyAvatar,
  loadAttestationMetadata,
  loadIdentityAddresses,
  recordGrowthAttestationEvents,
  recordGrowthProfileEvent,
  saveIdentity,
  validateIdentityIpfsData
}
