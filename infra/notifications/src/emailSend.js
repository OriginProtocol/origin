// TODO: We need better way to refer to models in other packages.
const Identity = require('../../identity/src/models').Identity

const { messageTemplates } = require('../templates/messageTemplates')
const { getNotificationMessage } = require('./notification')
const fs = require('fs')
const Sequelize = require('sequelize')
const Op = Sequelize.Op
const _ = require('lodash')
const logger = require('./logger')

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

//
// Email notifications for Messages
//
async function messageEmailSend(receivers, sender, config) {
  if (!receivers) throw 'receivers not defined'
  if (!sender) throw 'sender not defined'

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
    raw: true,
    where: {
      ethAddress: sender
    }
  })
  const messageReceivers = Identity.findAll({
    raw: true,
    where: {
      ethAddress: {
        [Op.or]: receivers
      }
    }
  })
  Promise.all([messageSender, messageReceivers]).then(
    ([senderIdentity, receiversIdentities]) => {
      receiversIdentities.forEach(async s => {
        try {
          const message = messageTemplates.message['email']['messageReceived']

          if (!s.email && config.overrideEmail) {
            if (config.verbose) {
              logger.info(`${s.ethAddress} has no email address. Skipping.`)
            }
          } else {
            // Construct best human readable version of sender name
            const senderName =
              senderIdentity.firstName || senderIdentity.lastName
                ? `${senderIdentity.firstName ||
                    ''} ${senderIdentity.lastName || ''} (${sender})`
                : sender
            const templateVars = {
              config: config,
              sender: sender,
              senderName: senderName
            }
            const email = {
              to: config.overrideEmail || s.email,
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

            if (config.verbose) {
              logger.log('email:')
              logger.log(email)
            }

            if (config.emailFileOut) {
              // Optional writing of email contents to files
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

  const emails = await Identity.findAll({
    where: {
      ethAddress: {
        [Op.or]: [buyerAddress, sellerAddress, party]
      }
    }
  })

  await emails.forEach(async s => {
    try {
      const recipient = s.ethAddress
      const recipientRole = recipient === sellerAddress ? 'seller' : 'buyer'

      if (config.verbose) {
        logger.info(`Checking messages for ${s.ethAddress} as ${recipientRole}`)
      }

      const message = getNotificationMessage(
        eventName,
        party,
        recipient,
        recipientRole,
        'email'
      )

      if (!s.email && !config.overrideEmail) {
        if (config.verbose) {
          logger.info(`${s.ethAddress} has no email address. Skipping.`)
        }
      } else if (!message) {
        if (config.verbose) {
          logger.info(`No message found`)
        }
      } else {
        const listingNetwork = listing.id.split('-')[0] // First section of id is the network num
        const networkDappDomains = {
          1: 'https://dapp.originprotocol.com',
          4: 'https://dapp.staging.originprotocol.com',
          2222: 'https://dapp.dev.originprotocol.com',
          999: 'http://localhost:3000'
        }
        const networkGatewayDomains = {
          1: 'https://ipfs.originprotocol.com',
          4: 'https://ipfs.staging.originprotocol.com',
          2222: 'https://ipfs.dev.originprotocol.com',
          999: 'http://localhost:8080'
        }
        const templateVars = {
          listing: listing,
          offer: offer,
          config: config,
          dappUrl: networkDappDomains[listingNetwork],
          ipfsGatewayUrl: networkGatewayDomains[listingNetwork]
        }
        const email = {
          to: config.overrideEmail || s.email,
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

        if (config.verbose) {
          logger.log('email:')
          logger.log(email)
        }

        if (config.emailFileOut) {
          // Optional writing of email contents to files
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
      }
    } catch (error) {
      logger.error(`Could not email via Sendgrid: ${error}`)
    }
  })
}

module.exports = { transactionEmailSend, messageEmailSend }
