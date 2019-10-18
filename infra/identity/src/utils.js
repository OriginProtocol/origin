const Sequelize = require('sequelize')

const db = {
  ...require('@origin/growth-event/src/models'),
  ...require('./models')
}
const { ip2geo } = require('@origin/ip2geo')

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
  return db.Attestation.findOne({ where, order: [['id', 'DESC']], })
}

/**
 * Loads attestation data such as email, phone, etc... from the attestation table.
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

async function loadIdentityAddresses(ownerAddress) {
  // Attestation rows in the DB may have been written under the
  // proxy eth address. Load proxy addresses.
  const addresses = [ ownerAddress ]
  const proxies = await db.Proxy.findAll({ where: { ownerAddress } })
  for (const proxy of proxies) {
    addresses.push(proxy.address)
  }
  return addresses
}


async function loadIdentityAttestationsMetadata(addresses, attestations) {
  const metadata = {}

  // Load attestation data.
  await Promise.all(
    attestations.map(async attestation => {
      const attestationService = _getAttestationService(attestation)
      switch (attestationService) {
        case 'email':
          metadata.email = await _loadValueFromAttestation(
            addresses,
            'EMAIL'
          )
          break
        case 'phone':
          metadata.phone = await _loadValueFromAttestation(
            addresses,
            'PHONE'
          )
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
          metadata.airbnb = await _loadValueFromAttestation(
            addresses,
            'AIRBNB'
          )
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
          metadata.google = await _loadValueFromAttestation(
            addresses,
            'GOOGLE'
          )
          break
        case 'linkedin':
          metadata.linkedin = await _loadValueFromAttestation(
            addresses,
            'LINKEDIN'
          )
          break
        case 'github':
          metadata.github = await _loadValueFromAttestation(
            addresses,
            'GITHUB'
          )
          break
        case 'kakao':
          metadata.kakao = await _loadValueFromAttestation(
            addresses,
            'KAKAO'
          )
          break
        case 'wechat':
          metadata.wechat = await _loadValueFromAttestation(
            addresses,
            'WECHAT'
          )
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
            logger.warn(
              `Could not find TELEGRAM attestation for ${addresses}`
            )
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
 * Records a ProfilePublished event in the growth_event table
 * at the condition that the identity has a first name and last name.
 *
 * @param {Object} user: Origin js user model object.
 * @param {Date} date: Event date.
 * @param {Object} growthEvent: See infra/growth-event/src/resources/GrowthEvent
 * @returns {Promise<void>}
 * @private
 */
async function recordGrowthProfileEvent(ethAddress, identity, date, growthEvent) {
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
async function recordGrowthAttestationEvents(ethAddress, attestations, date, growthEvent) {
  await Promise.all(
    attestations.map(attestation => {
      const attestationService = _getAttestationService(attestation)
      const eventType = growthEvent.AttestationServiceToEventType[attestationService]
      if (!eventType) {
        logger.error(`Unexpected att. service: ${attestationService}. Skipping.`)
        return
      }

      return growthEvent.insert(
        logger,
        1,
        ethAddress,
        eventType,
        null,
        null,
        date
      )
    })
  )
}

module.exports = {
  loadIdentityAddresses,
  loadIdentityAttestationsMetadata,
  recordGrowthProfileEvent,
  recordGrowthAttestationEvents
}
