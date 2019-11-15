const logger = require('./logger')
const {
  employeeUnlockDate,
  investorUnlockDate,
  lockupBonusRate,
  lockupDuration
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
  process.env.CLIENT_URL || 'https://investor.originprotocol.com'

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

module.exports = {
  discordWebhookUrl,
  encryptionSecret,
  employeeUnlockDate,
  investorUnlockDate,
  lockupBonusRate,
  lockupDuration,
  networkId,
  port,
  clientUrl,
  sendgridFromEmail,
  sendgridApiKey,
  sessionSecret
}
