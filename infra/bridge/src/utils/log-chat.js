'use strict'

const sendgridMail = require('@sendgrid/mail')
const { TelegramChatLog } = require('../models/index')

const logger = require('../logger')

/**
 * Stores the `message` event to database and sends
 * an email to the support email address
 */
module.exports = async message => {
  if (!message) {
    return
  }

  const username = message.from.username || message.from.id
  const messageText = message.text

  const email = {
    to:
      process.env.TELEGRAM_BOT_EMAIL ||
      'support+telegram-bot@originprotocol.com',
    from: process.env.SENDGRID_FROM_EMAIL,
    subject: `${username} has replied to Telegram Bot`,
    text: `> ${messageText}`
  }

  try {
    await sendgridMail.send(email)
  } catch (error) {
    logger.error(`Could not send email via SendGrid: ${error}`)
  }

  // Insert to DB
  await TelegramChatLog.create({
    rawPayload: message,
    message: messageText,
    userId: message.from.id,
    username
  })

  logger.debug('Logged chat from ', username)
}
