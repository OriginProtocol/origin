const fs = require('fs')
const _ = require('lodash')
const sendgridMail = require('@sendgrid/mail')
const Sequelize = require('sequelize')
const web3Utils = require('web3-utils')

const Identity = require('@origin/identity/src/models')
const { messageTemplates } = require('../templates/messageTemplates')
const { getNotificationMessage } = require('./notification')
const logger = require('./logger')
const {
  getMessageFingerprint,
  isNotificationDupe,
  logNotificationSent
} = require('./dupeTools')

// Configure SendGrid.
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
if (!process.env.SENDGRID_API_KEY) {
  logger.warn('Warning: SENDGRID_API_KEY env var is not set')
}
if (!process.env.SENDGRID_FROM_EMAIL) {
  logger.warn('Warning: SENDGRID_FROM_EMAIL env var is not set')
}

/**
 * Write the content of an email to a file. Useful during development.
 * @param {Object} email
 * @param {Object} config: Notification server config.
 * @private
 */
function _writeEmailToFile(email, config) {
  const now = new Date()
  fs.writeFile(
    `${config.emailFileOut}_${now.getTime()}_${email.to}.html`,
    email.html,
    error => {
      logger.error(error)
    }
  )
  fs.writeFile(
    `${config.emailFileOut}_${now.getTime()}_${email.to}.txt`,
    email.text,
    error => {
      logger.error(error)
    }
  )
}

/**
 * Sends an email to a user.
 *
 * @param {string} ethAddress: Eth address of the receiver.
 * @param {Object} email: SendGrid email object
 * @param {Object} config: Notification server configuration.
 * @returns {Promise<void>}
 * @private
 */
async function _sendEmail(ethAddress, email, config) {
  // Optional writing of email contents to files
  if (config.emailFileOut) {
    _writeEmailToFile(email, config)
  }

  // Check we are not spamming the user.
  const messageFingerprint = getMessageFingerprint(email)
  if ((await isNotificationDupe(messageFingerprint, config)) > 0) {
    logger.warn(`Duplicate. Notification already recently sent. Skipping.`)
    return
  }

  // Send the email and record the action in the notification_log table.
  await sendgridMail.send(email)
  await logNotificationSent(messageFingerprint, ethAddress, 'email')
  logger.log(`Email sent to ${ethAddress} at ${email.to}`)
}

/**
 * Sends an email to a list of users to let them know they
 * have a new Message in Origin messaging.
 *
 * @param {Array<string>} receivers: List of Eth address an email should be sent to.
 * @param {string} sender: Eth address of the user that sent the Origin message.
 * @param {string} messageHash: Origin message hash.
 * @param {Object} config: Notification server config.
 * @returns {Promise<void>}
 */
async function messageEmailSend(receivers, sender, messageHash, config) {
  if (!receivers) throw new Error('receivers not defined')
  if (!sender) throw new Error('sender not defined')

  // Force lowercase
  sender = sender.toLowerCase()
  receivers = receivers.map(r => r.toLowerCase())

  logger.info(
    `Messsage email: attempting to email addresses ${receivers.join(',')}`
  )

  // Load email template
  const templateDir = `${__dirname}/../templates`

  // Standard template for HTML emails
  const emailTemplateHtml = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.html`).toString()
  )
  // Standard template for text emails
  const emailTemplateTxt = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.txt`).toString()
  )

  // Load the sender's identity and construct the best human readable
  // version of sender name.
  const senderIdentity = Identity.findOne({
    where: {
      ethAddress: sender
    }
  })
  const senderName =
    senderIdentity !== null &&
    senderIdentity.firstName &&
    senderIdentity.lastName
      ? `${senderIdentity.firstName || ''} ${senderIdentity.lastName ||
          ''} (${web3Utils.toChecksumAddress(sender)})`
      : web3Utils.toChecksumAddress(sender)

  // Dynamic variables used when evaluating the template.
  const templateVars = {
    config,
    sender,
    senderName,
    dappUrl: config.dappUrl,
    ipfsGatewayUrl: config.ipfsGatewayUrl,
    messageHash
  }

  // Load the identities of all the receivers.
  const identities = Identity.findAll({
    where: { ethAddress: { [Sequelize.Op.or]: receivers } }
  })

  // Send an email to each receiver.
  for (const identity of identities) {
    if (!identity.email && !config.overrideEmail) {
      logger.info(`${identity.ethAddress} has no email address. Skipping.`)
      continue
    }

    try {
      const message = messageTemplates.message['email']['messageReceived']
      const email = {
        to: config.overrideEmail || identity.email,
        from: config.fromEmail,
        subject: message.subject(templateVars),
        text: emailTemplateTxt({
          message: message.text(templateVars),
          messageHash
        }),
        html: emailTemplateHtml({
          message: message.html(templateVars),
          messageHash
        }),
        asm: {
          groupId: config.asmGroupId
        },
        __messageHash: messageHash // Not part of SendGrid spec, here prevent different messages from being counted as duplicates.
      }

      await _sendEmail(identity.ethAddress, email, config)
    } catch (error) {
      logger.error(
        `Could not email ${identity.ethAddress} via Sendgrid: ${error}`
      )
    }
  }
}

/**
 * Sends an email to a buyer or seller to notify them
 * that the state of one of their offer changed.
 *
 * @param {string} eventName: Name of the event. Example: OfferCreated, OfferAccepted, ...
 * @param {string} party: Either the buyer or the seller Eth address.
 * @param {string} buyerAddress: Buyer's Eth address.
 * @param {string} sellerAddress: Seller's Eth address.
 * @param {Object} offer: Offer object.
 * @param {Object} listing: Listing object.
 * @param {Object} config: Notification server configuration.
 * @returns {Promise<void>}
 */
async function transactionEmailSend(
  eventName,
  party,
  buyerAddress,
  sellerAddress,
  offer,
  listing,
  config
) {
  if (!eventName) throw new Error('eventName not defined')
  if (!party) throw new Error('party not defined')
  if (!buyerAddress) throw new Error('buyerAddress not defined')
  if (!sellerAddress) throw new Error('sellerAddress not defined')
  if (!offer) throw new Error('offer not defined')
  if (!listing) throw new Error('listing not defined')
  if (!config) throw new Error('config not defined')

  // Force lowercase
  buyerAddress = buyerAddress.toLowerCase()
  sellerAddress = sellerAddress.toLowerCase()
  party = party.toLowerCase()

  logger.info(
    `Transaction Email: party:${party} buyerAddress:${buyerAddress} sellerAddress:${sellerAddress}`
  )

  // Load email template
  const templateDir = `${__dirname}/../templates`

  // Standard template for HTML emails
  const emailTemplateHtml = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.html`).toString()
  )
  // Standard template for text emails
  const emailTemplateTxt = _.template(
    fs.readFileSync(`${templateDir}/emailTemplate.txt`).toString()
  )

  const templateVars = {
    listing,
    offer,
    config,
    dappUrl: config.dappUrl,
    ipfsGatewayUrl: config.ipfsGatewayUrl
  }

  const identities = await Identity.findAll({
    where: {
      ethAddress: {
        [Sequelize.Op.or]: [buyerAddress, sellerAddress, party]
      }
    }
  })

  // Send an email to each recipient.
  for (const identity of identities) {
    if (!identity.email && !config.overrideEmail) {
      logger.info(`${identity.ethAddress} has no email address. Skipping.`)
      continue
    }

    try {
      const recipient = identity.ethAddress.toLowerCase()
      const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'
      logger.info(
        `Sending email for ${identity.ethAddress} as ${recipientRole}`
      )

      const message = getNotificationMessage(
        eventName,
        party,
        recipient,
        recipientRole,
        'email'
      )
      if (!message) {
        logger.info(`No template defined for ${eventName}. Skipping.`)
        continue
      }

      const email = {
        to: config.overrideEmail || identity.email,
        from: config.fromEmail,
        subject: message.subject(templateVars),
        text: emailTemplateTxt({
          message: message.text(templateVars)
        }),
        html: emailTemplateHtml({
          message: message.html(templateVars)
        }),
        asm: {
          groupId: config.asmGroupId
        }
      }

      await _sendEmail(identity.ethAddress, email, config)
    } catch (error) {
      logger.error(`Could not email via Sendgrid: ${error}`)
    }
  }
}

module.exports = { transactionEmailSend, messageEmailSend }
