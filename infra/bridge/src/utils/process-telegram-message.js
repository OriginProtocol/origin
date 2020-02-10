const Web3 = require('web3')

const logger = require('../logger')

const { createTelegramAttestation } = require('./attestation')

const growthEventHelper = require('./growth-event-helpers')
const logChat = require('./log-chat')

const _chunk = require('lodash/chunk')

const processMessage = async ({ message, onReplyMessage, onEndResponse }) => {
  logger.debug('Message from Telegram', message)

  if (message.text && !message.from.is_bot && message.chat.type === 'private') {
    // For attestations
    let startCmdParam = /^\/start (.+)$/gi.exec(message.text)

    if (
      startCmdParam &&
      startCmdParam[1] &&
      Web3.utils.isAddress(startCmdParam[1].toLowerCase())
    ) {
      startCmdParam = startCmdParam[1]

      logger.debug(`Pushing attestation message for address '${startCmdParam}'`)

      await createTelegramAttestation({
        identity: startCmdParam,
        message
      })

      onReplyMessage(
        message.chat.id,
        'Great, now go back to the Origin Marketplace app to continue'
      )
    } else if (message.text.startsWith('/start')) {
      // User tried to send /start directly
      logger.debug('Ignoring invalid attestation request')
      onReplyMessage(
        message.chat.id,
        'Please return to the Origin Marketplace app and retry your Telegram verification.'
      )
    } else {
      // Log unexpected private chat messages to DB
      logger.debug('Logging chat')

      await logChat(message)
      onReplyMessage(
        message.chat.id,
        `Unfortunately, we won't be able to respond to your message here. Please check out https://help.originprotocol.com where you can find answers to many of your questions along with a contact form. Thanks!`
      )
    }
  } else if (onEndResponse) {
    onEndResponse()
  }

  let followCount = 0
  let totalFollowEvents = 0

  /**
   * Bots can be added to any group by anyone. So check the group id
   * before rewarding the user on production
   */
  const isGroup = message.chat && message.chat.type !== 'private'
  const isValidGroup =
    process.env.NODE_ENV !== 'production' ||
    (isGroup &&
      (message.chat.username.toLowerCase() === 'originprotocolkorea' ||
        message.chat.username.toLowerCase() === 'originprotocol'))

  if (isValidGroup && message.new_chat_members) {
    // For join verifications
    const events = message.new_chat_members
    // Note: Splitting the events into smaller chunks to avoid DB bottleneck
    // if we receive a very large number of events at once
    const chunks = _chunk(
      message.new_chat_members,
      process.env.CHUNK_COUNT || 100
    )
    totalFollowEvents = events.length

    for (const chunk of chunks) {
      const promises = chunk
        .filter(member => !member.is_bot)
        .map(member => {
          followCount++

          // Note: Username is optional in Telegram.
          // ID is returned as number, We don't want to run into the big number issues
          // So use id only if username is not set
          const username = String(member.username || member.id)

          return growthEventHelper({
            type: 'FOLLOW',
            socialNetwork: 'TELEGRAM',
            username: username,
            event: member
          })
        })
      await Promise.all(promises)
    }
  }

  if (totalFollowEvents > 0) {
    logger.debug(
      `[TELEGRAM] Processed ${followCount}/${totalFollowEvents} new chat member events`
    )
  }
}

module.exports = processMessage
