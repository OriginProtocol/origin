'use strict'

const sendgridMail = require('@sendgrid/mail')
const Logger = require('logplease')
const jwt = require('jsonwebtoken')

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

const logger = Logger.create('sendWelcomeToken')
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
 *
 */
async function sendWelcomeEmail(email) {
  logger.info('Sending welcome email to', email)

  const user = await User.findOne({ where: { email } })

  let token
  if (user) {
    token = jwt.sign(
      {
        email
      },
      encryptionSecret,
      { expiresIn: '24h' }
    )
  } else {
    logger.error('No such user')
    return
  }

  const data = {
    to: email,
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

const args = parseArgv()
const config = {
  email: args['--email'] || null,
  all: args['--all'] === 'true' || false
}

if (!config.email && !config.all) {
  throw new Error('one of --email or --all is a required argument.')
}

if (config.email) {
  // TODO validate email
  sendWelcomeEmail(config.email)
} else {
  logger.info('Sending welcome email to all users')
  // TODO implement this
}
