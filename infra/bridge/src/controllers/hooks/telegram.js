'use strict'

const express = require('express')
const router = express.Router()

const Web3 = require('web3')

const logger = require('../../logger')

const { subscribeToHooks } = require('../../hooks/telegram')
const { createTelegramAttestation } = require('../../utils/attestation')

const growthEventHelper = require('../../utils/growth-event-helpers')
const logChat = require('../../utils/log-chat')

const _chunk = require('lodash/chunk')

/**
 * To register the webhook
 */
router.get('/__init', async (req, res) => {
  try {
    await subscribeToHooks()

    return res.status(200).send({
      success: true
    })
  } catch (err) {
    logger.error(err)
    return res.status(400).send({
      success: false,
      errors: [
        `Failed to subscribe: ${err.message ? err.message : 'Check logs'}`
      ]
    })
  }
})

const replyWithMessage = (res, chatId, message) => {
  return res
    .status(200)
    .header('Content-Type', 'application/json')
    .send({
      method: 'sendMessage',
      chat_id: chatId,
      text: message
    })
}

router.post('/', async (req, res) => {
  const message = req.body.message

  if (!message) {
    logger.error('No message in response??', res.body)
    res.send(200).end()
    return
  }

  logger.debug('Message from Telegram', message)

  let responseSent = false

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

      replyWithMessage(
        res,
        message.chat.id,
        'Hey there, Get back to the Origin Marketplace app to continue'
      )
    } else {
      // Log unexpected private chat messages to DB
      logger.debug('Logging chat')

      await logChat(message)
      replyWithMessage(
        res,
        message.chat.id,
        'Hey there, we have received your message. Our team will reach out to you as soon as possible.'
      )
    }

    responseSent = true
  }

  if (!responseSent) {
    // Set status code and send back the empty response,
    // so that connection doesn't has to be alive
    res.send(200).end()
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
          const username = member.username || member.id

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
})

module.exports = router
