'use strict'

const Logger = require('logplease')
const jwt = require('jsonwebtoken')

const logger = Logger.create('sendWelcomeToken')

const { sendEmail } = require('../lib/email')

try {
  require('envkey')
} catch (error) {
  logger.warn('EnvKey not configured')
}

const { User } = require('../models')
const { encryptionSecret, logLevel, clientUrl } = require('../config')

Logger.setLogLevel(logLevel)

/**
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

function generateToken(user) {
  return jwt.sign(
    {
      email: user.email
    },
    encryptionSecret,
    // TODO revert to 24h
    { expiresIn: '14d' }
  )
}

/**
 * Send a welcome email to a user allowing them to start the onboarding process.
 */
async function sendWelcomeEmail(user) {
  if (user.welcomed) {
    logger.error(
      `Not sending a welcome email to ${user.email}, use --force=true to force delivery`
    )
  } else {
    logger.info('Sending welcome email to', user.email)
  }

  const token = generateToken(user)
  const vars = { url: `${clientUrl}/login_handler/${token}` }
  try {
    await sendEmail(user.email, 'welcome', vars)
  } catch (error) {
    logger.error(error.response.body)
    return
  }

  logger.info('Email sent')

  await user.update({
    welcomed: true
  })
}

/**
 * Sends emails to a single user or all users depending on args.
 */
async function main(config) {
  if (config.email) {
    const user = await User.findOne({ where: { email: config.email } })
    if (!user) {
      logger.error('User with that email does not exist')
      process.exit()
    }
    if (config.token) {
      console.log('Token:', generateToken(user))
    } else {
      await sendWelcomeEmail(user)
    }
  } else {
    logger.info('Sending welcome email to all users')
    const users = await User.findAll()
    users.map(await sendWelcomeEmail)
  }
}

const args = parseArgv()
const config = {
  // Send a welcome email to a specific email
  email: args['--email'] || null,
  // Send a welcome email to all users
  all: args['--all'] === 'true' || false,
  // Print the token
  token: args['--token'] === 'true' || false,
  // Default behaviour does not redeliver welcome emails to users who have
  // already been marked as welcomed, use this flag to force redelivery
  force: args['--force'] === true || false
}

if (!config.email && !config.all) {
  throw new Error('one of --email or --all is a required argument.')
}

main(config)
