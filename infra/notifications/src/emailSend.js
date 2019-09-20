// TODO: We need better way to refer to models in other packages.
const Identity = require('../../identity/src/models').Identity

const { messageTemplates } = require('../templates/messageTemplates')
const { getNotificationMessage } = require('./notification')
const fs = require('fs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const _ = require('lodash')
const logger = require('./logger')
const web3Utils = require('web3-utils')

const sendgridMail = require('@sendgrid/mail')
sendgridMail.setApiKey(process.env.SENDGRID_API_KEY)
if (!process.env.SENDGRID_API_KEY) {
  logger.warn('Warning: SENDGRID_API_KEY env var is not set')
}
if (!process.env.SENDGRID_FROM_EMAIL) {
  logger.warn('Warning: SENDGRID_FROM_EMAIL env var is not set')
}

const {
  getMessageFingerprint,
  isNotificationDupe,
  logNotificationSent
} = require('./dupeTools')

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
 * Sends an email to a list of receivers to let them know they
 * received a new Message in Origin messaging.
 */
async function messageEmailSend(receivers, sender, messageHash, config) {
  if (!receivers) throw new Error('receivers not defined')
  if (!sender) throw new Error('sender not defined')

  // Force lowercase
  sender = sender.toLowerCase()
  receivers = receivers.map(function(r) {
    return r.toLowerCase()
  })

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

  const messageSender = Identity.findOne({
    where: {
      ethAddress: sender
    }
  })
  const messageReceivers = Identity.findAll({
    where: {
      ethAddress: {
        [Op.or]: receivers
      }
    }
  })
  Promise.all([messageSender, messageReceivers]).then(
    ([senderIdentity, receiversIdentities]) => {
      console.log(senderIdentity)
      receiversIdentities.forEach(async s => {
        try {
          const message = messageTemplates.message['email']['messageReceived']

          if (!s.email && config.overrideEmail) {
            logger.info(`${s.ethAddress} has no email address. Skipping.`)
          } else {
            // Construct best human readable version of sender name
            const senderName =
              senderIdentity !== null &&
              senderIdentity.firstName &&
              senderIdentity.lastName
                ? `${senderIdentity.firstName ||
                    ''} ${senderIdentity.lastName ||
                    ''} (${web3Utils.toChecksumAddress(sender)})`
                : web3Utils.toChecksumAddress(sender)
            const templateVars = {
              config,
              sender,
              senderName,
              dappUrl: config.dappUrl,
              ipfsGatewayUrl: config.ipfsGatewayUrl,
              messageHash
            }
            const email = {
              to: config.overrideEmail || s.email,
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

            // Optional writing of email contents to files
            if (config.emailFileOut) {
              _writeEmailToFile(email)
            }

            const messageFingerprint = getMessageFingerprint(email)
            if ((await isNotificationDupe(messageFingerprint, config)) > 0) {
              logger.warn(
                `Duplicate. Notification already recently sent. Skipping.`
              )
            } else {
              try {
                await sendgridMail.send(email)
                await logNotificationSent(
                  messageFingerprint,
                  s.ethAddress,
                  'email'
                )
                logger.log(
                  `Email sent to ${s.ethAddress} at ${email.to} ${
                    config.overrideEmail ? ' instead of ' + s.email : ''
                  }`
                )
              } catch (error) {
                logger.error(`Could not email via Sendgrid: ${error}`)
              }
            }
          }
        } catch (error) {
          logger.error(`Could not email via Sendgrid: ${error}`)
        }
      })
    }
  )
}

//
// Email notifications for Transactions
//
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

  const identities = await Identity.findAll({
    where: {
      ethAddress: {
        [Op.or]: [buyerAddress, sellerAddress, party]
      }
    }
  })

  for (const identity of identities) {
    try {
      const recipient = identity.ethAddress.toLowerCase()
      const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

      logger.info(`Checking messages for ${identity.ethAddress} as ${recipientRole}`)

      const message = getNotificationMessage(
        eventName,
        party,
        recipient,
        recipientRole,
        'email'
      )

      if (!identity.email && !config.overrideEmail) {
        logger.info(`${identity.ethAddress} has no email address. Skipping.`)
        continue
      }
      if (!message) {
        logger.info(`No message found`)
        continue
      }
      const templateVars = {
        listing,
        offer,
        config,
        dappUrl: config.dappUrl,
        ipfsGatewayUrl: config.ipfsGatewayUrl
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

      // Optional writing of email contents to files
      if (config.emailFileOut) {
        _writeEmailToFile(email)
      }

      const messageFingerprint = getMessageFingerprint(email)
      if ((await isNotificationDupe(messageFingerprint, config)) > 0) {
        logger.warn(
          `Duplicate. Notification already recently sent. Skipping.`
        )
      } else {
        try {
          await sendgridMail.send(email)
          await logNotificationSent(messageFingerprint, s.ethAddress, 'email')
          logger.log(
            `Email sent to ${buyerAddress} at ${email.to} ${
              config.overrideEmail ? ' instead of ' + s.email : ''
            }`
          )
        } catch (error) {
          logger.error(`Could not email via Sendgrid: ${error}`)
        }
      }
    } catch (error) {
      logger.error(`Could not email via Sendgrid: ${error}`)
    }
  }
}

module.exports = { transactionEmailSend, messageEmailSend }
