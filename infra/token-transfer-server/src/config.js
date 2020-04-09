require('dotenv').config()

const moment = require('moment')

const logger = require('./logger')
const {
  transferConfirmationTimeout,
  lockupConfirmationTimeout
} = require('./shared')

const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL || null

const encryptionSecret = process.env.ENCRYPTION_SECRET
if (!encryptionSecret) {
  console.log('ENCRYPTION_SECRET must be set through EnvKey or manually')
  process.exit(1)
}

const networkId = Number.parseInt(process.env.NETWORK_ID) || 999

const port = process.env.PORT || 5000

const clientUrl =
  process.env.CLIENT_URL || 'https://investor.originprotocol.com/#'

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

const largeTransferThreshold =
  Number(process.env.LARGE_TRANSFER_THRESHOLD) || 100000

const largeTransferDelayMinutes = process.env.LARGE_TRANSFER_DELAY_MINUTES || 60

const otcPartnerEmails = (
  process.env.OTC_PARTNER_EMAIL || 'investor-relations@originprotocol.com'
).split(',')

const gasPriceMultiplier = process.env.GAS_PRICE_MULTIPLIER

// Unlock date, if undefined assume tokens are locked with an unknown unlock
// date
const unlockDate = moment(process.env.UNLOCK_DATE, 'YYYY-MM-DD').isValid()
  ? moment.utc(process.env.UNLOCK_DATE)
  : undefined

// Lockup bonus rate as a percentage
const lockupBonusRate = Number(process.env.LOCKUP_BONUS_RATE) || 17.5

// Early lockup bons rate as a percentage
const earlyLockupBonusRate = Number(process.env.EARLY_LOCKUP_BONUS_RATE) || 35

// Date early lockups are enabled until
const earlyLockupsEnabledUntil = process.env.EARLY_LOCKUPS_ENABLED_UNTIL

// Whether early lockups are enabled, derived from the date lockups are enakjbled until
const earlyLockupsEnabled = moment(
  earlyLockupsEnabledUntil,
  'YYYY-MM-DD'
).isValid()
  ? moment.utc(earlyLockupsEnabledUntil) > moment.utc()
  : false

// Lockup duration in months
const lockupDuration = Number(process.env.LOCKUP_DURATION) || 12

// Whether lockups are enabled
const lockupsEnabled = process.env.LOCKUPS_ENABLED || true

// Whether OTC requests are enabled
const otcRequestEnabled = process.env.OTC_REQUEST_ENABLED || false

module.exports = {
  discordWebhookUrl,
  encryptionSecret,
  earlyLockupBonusRate,
  earlyLockupsEnabledUntil,
  earlyLockupsEnabled,
  lockupsEnabled,
  lockupBonusRate,
  lockupConfirmationTimeout,
  lockupDuration,
  networkId,
  otcPartnerEmails,
  port,
  clientUrl,
  sendgridFromEmail,
  sendgridApiKey,
  sessionSecret,
  unlockDate,
  largeTransferThreshold,
  largeTransferDelayMinutes,
  gasPriceMultiplier,
  transferConfirmationTimeout,
  otcRequestEnabled
}
