const moment = require('moment')

const logger = require('./logger')

const encryptionSecret = process.env.ENCRYPTION_SECRET
if (!encryptionSecret) {
  console.log('ENCRYPTION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

const networkId = Number.parseInt(process.env.NETWORK_ID) || 999

const portalUrl =
  process.env.PORTAL_URL || 'https://investor.originprotocol.com'

// Sendgrid configuration
const sendgridFromEmail = process.env.SENDGRID_FROM_EMAIL
if (!sendgridFromEmail) {
  logger.error('SENDGRID_FROM_EMAIL must be set through EnvKey or manually')
  process.exit(1)
}

const sendgridApiKey = process.env.SENDGRID_API_KEY
if (!sendgridFromEmail) {
  logger.error('SENDGRID_API_KEY must be set through EnvKey or manually')
  process.exit(1)
}

const unlockDate = process.env.UNLOCK_DATE
  ? moment.utc(process.env.UNLOCK_DATE)
  : moment.utc('2020-01-01')

module.exports = {
  encryptionSecret,
  networkId,
  portalUrl,
  sendgridFromEmail,
  sendgridApiKey,
  unlockDate
}
