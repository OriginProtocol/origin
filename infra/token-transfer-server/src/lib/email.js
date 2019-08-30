'use strict'

const fs = require('fs')
const template = require('lodash/template')
const sendgridMail = require('@sendgrid/mail')

const { sendgridFromEmail, sendgridApiKey } = require('../config')
sendgridMail.setApiKey(sendgridApiKey)

// Load and compile the email templates.
const templateDir = `${__dirname}/../templates`
const welcomeTextTemplate = template(
  fs.readFileSync(`${templateDir}/welcome.txt`).toString()
)
const welcomeHtmlTemplate = template(
  fs.readFileSync(`${templateDir}/welcome.html`).toString()
)
const loginTextTemplate = template(
  fs.readFileSync(`${templateDir}/login.txt`).toString()
)
const loginHtmlTemplate = template(
  fs.readFileSync(`${templateDir}/login.html`).toString()
)
const transferTextTemplate = template(
  fs.readFileSync(`${templateDir}/transfer.txt`).toString()
)
const transferHtmlTemplate = template(
  fs.readFileSync(`${templateDir}/transfer.html`).toString()
)

/**
 * Returns the content to be used for an email.
 *
 * @param {string} emailType: 'welcome', 'login' or 'transfer'
 * @param {Object} vars: dynamic variables
 * @returns {{subject: string, html: string, text: string}}
 */
function _generateEmail(emailType, vars) {
  let subject, text, html
  switch (emailType) {
    case 'welcome':
      subject = 'Welcome to the Origin Investor Portal'
      text = welcomeTextTemplate(vars)
      html = welcomeHtmlTemplate(vars)
      break
    case 'login':
      subject = 'Your Origin Token Portal Verification Code'
      text = loginTextTemplate(vars)
      html = loginHtmlTemplate(vars)
      break
    case 'transfer':
      subject = `Confirm Your Origin Token Withdrawal`
      text = transferTextTemplate(vars)
      html = transferHtmlTemplate(vars)
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

module.exports = { sendEmail }
