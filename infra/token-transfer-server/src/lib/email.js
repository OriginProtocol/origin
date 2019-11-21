'use strict'

const fs = require('fs')
const template = require('lodash/template')
const sendgridMail = require('@sendgrid/mail')
const jwt = require('jsonwebtoken')
const mjml2html = require('mjml')

const { User } = require('../models')
const {
  encryptionSecret,
  clientUrl,
  sendgridFromEmail,
  sendgridApiKey
} = require('../config')
const logger = require('../logger')

sendgridMail.setApiKey(sendgridApiKey)

// Load and compile the email templates.
const templateDir = `${__dirname}/../templates`
const welcomeTextTemplate = template(
  fs.readFileSync(`${templateDir}/welcome.txt`).toString()
)
const welcomeMjmlTemplate = template(
  fs.readFileSync(`${templateDir}/welcome.mjml`).toString()
)
const loginTextTemplate = template(
  fs.readFileSync(`${templateDir}/login.txt`).toString()
)
const loginMjmlTemplate = template(
  fs.readFileSync(`${templateDir}/login.mjml`).toString()
)
const transferTextTemplate = template(
  fs.readFileSync(`${templateDir}/transfer.txt`).toString()
)
const transferMjmlTemplate = template(
  fs.readFileSync(`${templateDir}/transfer.mjml`).toString()
)
const lockupTextTemplate = template(
  fs.readFileSync(`${templateDir}/lockup.txt`).toString()
)
const lockupMjmlTemplate = template(
  fs.readFileSync(`${templateDir}/lockup.mjml`).toString()
)

/**
 * Returns the content to be used for an email.
 *
 * @param {string} emailType: 'welcome', 'login' or 'transfer'
 * @param {Object} vars: dynamic variables
 * @returns {{subject: string, html: string, text: string}}
 */
function _generateEmail(emailType, vars) {
  let subject, text, html, mjml

  // Note: We add the templates directory to dynamic vars. It is used to set
  // the path in the mjml-include directives.
  vars.path = templateDir

  switch (emailType) {
    case 'welcome':
      subject = 'Welcome to the Origin Investor Portal'
      text = welcomeTextTemplate(vars)
      mjml = mjml2html(welcomeMjmlTemplate(vars))
      if (mjml.errors.length) {
        throw new Error('Email template error:', mjml.errors)
      }
      html = mjml.html
      break
    case 'login':
      subject = 'Your Origin Token Portal Verification Code'
      text = loginTextTemplate(vars)
      mjml = mjml2html(loginMjmlTemplate(vars))
      if (mjml.errors.length) {
        throw new Error('Email template error:', mjml.errors)
      }
      html = mjml.html
      break
    case 'transfer':
      subject = `Confirm Your Origin Token Withdrawal`
      text = transferTextTemplate(vars)
      mjml = mjml2html(transferMjmlTemplate(vars))
      if (mjml.errors.length) {
        throw new Error('Email template error:', mjml.errors)
      }
      html = mjml.html
      break
    case 'lockup':
      subject = `Confirm Your Origin Token Lockup`
      text = lockupTextTemplate(vars)
      mjml = mjml2html(lockupMjmlTemplate(vars))
      if (mjml.errors.length) {
        throw new Error('Email template error:', mjml.errors)
      }
      html = mjml.html
      break
    default:
      throw new Error(`Invalid email type ${emailType}`)
  }
  return { subject, text, html }
}

/**
 * Sends an email.
 *
 * @param {string} to: email address of the recipient
 * @param {string} emailType: 'welcome', 'login' or 'transfer'
 * @param {Object} vars: dynamic variables
 * @returns {Promise<void>}
 */
async function sendEmail(to, emailType, vars) {
  const { subject, text, html } = _generateEmail(emailType, vars)
  await sendgridMail.send({
    to,
    from: sendgridFromEmail,
    subject,
    text,
    html
  })
}

async function sendLoginToken(email) {
  // Check the user exists before sending an email code.
  const user = await User.findOne({ where: { email } })
  if (user) {
    const token = jwt.sign(
      {
        email
      },
      encryptionSecret,
      { expiresIn: '30m' }
    )

    const vars = { url: `${clientUrl}/login_handler/${token}` }
    await sendEmail(user.email, 'login', vars)
    logger.info(`Sent email token to ${email}`)
  } else {
    // Do nothing in case email not found in our DB.
    // But do not let the caller know by returning anything different,
    // to avoid tipping them on whether or not the email exists.
    logger.warn(`Email ${email} not found in DB. No token sent.`)
  }
}

module.exports = { sendEmail, sendLoginToken }
