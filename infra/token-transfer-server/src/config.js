const moment = require('moment')

const logger = require('./logger')

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || null

const encryptionSecret = process.env.ENCRYPTION_SECRET
if (!encryptionSecret) {
  console.log('ENCRYPTION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

const networkId = Number.parseInt(process.env.NETWORK_ID) || 999

const port = process.env.PORT || 5000

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

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  logger.error('SESSION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

const unlockDate = process.env.UNLOCK_DATE
  ? moment.utc(process.env.UNLOCK_DATE)
  : moment.utc('2020-01-01')

// Lockup bonus rate as a percentage
const lockupBonusRate = process.env.LOCKUP_BONUS_RATE || 10

// Lockup duration in months
const lockupDuration = process.env.LOCKUP_DURATION || 12

const emailConfirmTimeout = process.env.EMAIL_CONFIRMATION_TIMEOUT || 5

module.exports = {
  discordWebhookUrl,
  emailConfirmTimeout,
  encryptionSecret,
  lockupBonusRate,
  lockupDuration,
  networkId,
  port,
  portalUrl,
  sendgridFromEmail,
  sendgridApiKey,
  sessionSecret,
  unlockDate
}
