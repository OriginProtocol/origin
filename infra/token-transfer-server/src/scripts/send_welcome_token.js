'use strict'

const sendgridMail = require('@sendgrid/mail')
const Logger = require('logplease')
const jwt = require('jsonwebtoken')

const logger = Logger.create('sendWelcomeToken')

try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}

const { User } = require('../models')
const {
  encryptionSecret,
  logLevel,
  portalUrl,
  sendgridFromEmail,
  sendgridApiKey
} = require('../config')

Logger.setLogLevel(logLevel)
sendgridMail.setApiKey(sendgridApiKey)

/*
 * Parse command line arguments into a dict.
 * @returns {Object} - Parsed arguments.
 */
function parseArgv() {
  const args = {}
  for (const arg of process.argv) {
    const elems = arg.split('=')
    const key = elems[0]
    const val = elems.length > 1 ? elems[1] : true
    args[key] = val
  }
  return args
}

/* Send a welcome email to a user allowing them to start the onboarding process.
 */
async function sendWelcomeEmail(user) {
  logger.info('Sending welcome email to', user.email)

  const token = jwt.sign(
    {
      email: user.email
    },
    encryptionSecret,
    { expiresIn: '24h' }
  )

  const data = {
    to: user.email,
    from: sendgridFromEmail,
    subject: 'Welcome to the Origin Investor Portal',
    text: `The following link will provide you access to the Origin Investor Portal.

    ${portalUrl}/welcome/${token}.

    It will expire in 24 hours. You can reply directly to this email with any questions.`
  }

  try {
    await sendgridMail.send(data)
  } catch (error) {
    logger.error(error.response.body)
    return
  }
  logger.info('Email sent')
}

/* Sends emails to a single user or all users depending on args.
 */
async function main(config) {
  if (config.email) {
    const user = await User.findOne({ where: { email: config.email } })
    if (!user) {
      logger.error('User with that email does not exist')
      process.exit()
    }
    sendWelcomeEmail(user)
  } else {
    logger.info('Sending welcome email to all users')
    const users = await User.findAll()
    users.map(sendWelcomeEmail)
  }
}

const args = parseArgv()
const config = {
  email: args['--email'] || null,
  all: args['--all'] === 'true' || false
}

if (!config.email && !config.all) {
  throw new Error('one of --email or --all is a required argument.')
}

main(config)
