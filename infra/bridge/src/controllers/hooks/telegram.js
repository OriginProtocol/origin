'use strict'

const express = require('express')
const router = express.Router()

const Web3 = require('web3')

const logger = require('../../logger')

const { subscribeToHooks } = require('../../hooks/telegram')
const { createTelegramAttestation } = require('../../utils/attestation')

const growthEventHelper = require('../../utils/growth-event-helpers')

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

router.post('/', (req, res) => {
  let followCount = 0
  let totalFollowEvents = 0

  let shouldSendReplyMessage = false

  const message = req.body.message

  if (message.text && !message.from.is_bot && message.chat.type === 'private') {
    // For attestations
    let payload = /^\/start (.+)$/gi.exec(message.text)

    if (
      payload &&
      payload[1] &&
      Web3.utils.isAddress(payload[1].toLowerCase())
    ) {
      payload = payload[1]

      logger.debug(`Pushing attestation message with payload '${payload}'`)

      createTelegramAttestation({
        identity: payload,
        message
      })

      shouldSendReplyMessage = true
    } else {
      // Log these to DB
    }
  }

  /**
   * Bots can be added to any group by anyone. So check the group id
   * before rewarding the user on production
   */
  const isGroup = message.chat && message.chat.type === 'group'
  const isValidGroup =
    process.env.NODE_ENV !== 'production' ||
    (isGroup &&
      (message.chat.username.toLowerCase() === 'OriginProtocolKorea' ||
        message.chat.username.toLowerCase() === 'originprotocol'))

  if (isValidGroup && message.new_chat_members) {
    // For join verifications
    const events = message.new_chat_members
    totalFollowEvents = events.length

    events.forEach(member => {
      if (member.is_bot) {
        // Ignore bots
        return
      }

      followCount++

      // Note: Username is optional in Telegram.
      // ID is returned as number, We don't want to run into the big number issues
      // So use id only if username is not set
      const username = member.username || member.id

      // Not awaiting this async operation intentionally
      growthEventHelper({
        type: 'FOLLOW',
        socialNetwork: 'TELEGRAM',
        username: username,
        event: member
      })
    })
  }

  if (totalFollowEvents > 0) {
    logger.debug(
      `[TELEGRAM] Processed ${followCount}/${totalFollowEvents} new chat member events`
    )
  }

  if (shouldSendReplyMessage) {
    return res
      .status(200)
      .header('Content-Type', 'application/json')
      .send({
        method: 'sendMessage',
        chat_id: message.chat.id,
        text: 'Hey there, Get back to the Origin Marketplace app to continue'
      })
  }

  res.status(200).end()
})

module.exports = router
