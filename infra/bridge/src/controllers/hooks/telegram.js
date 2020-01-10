'use strict'

const express = require('express')
const router = express.Router()

const logger = require('../../logger')

const {
  subscribeToHooks,
  deleteWebhook,
  getWebhookInfo,
  clearOutstandingQueue,
  startPollingFallback,
  cancelPolling
} = require('../../hooks/telegram')

const telegramIPWhitelistMiddleware = require('../../utils/ip-whitelist')
const webhookAuthMiddleware = require('../../utils/webhook-auth')

const processMessage = require('../../utils/process-telegram-message')

/**
 * To register the webhook
 */
router.get('/__init', async (req, res) => {
  try {
    if (process.env.TELEGRAM_DISABLE_WEBHOOKS !== 'true') {
      cancelPolling()
      await subscribeToHooks()
    } else {
      startPollingFallback()
    }

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

router.post('/__getWebhookInfo', webhookAuthMiddleware, async (req, res) => {
  try {
    return res.status(200).send({
      ...(await getWebhookInfo())
    })
  } catch (err) {
    logger.error(err)
    return res.status(400).send({
      success: false,
      errors: [
        `Failed to get webhook info: ${
          err.message ? err.message : 'Check logs'
        }`
      ]
    })
  }
})

router.post('/__deleteWebhook', webhookAuthMiddleware, async (req, res) => {
  try {
    await deleteWebhook()

    return res.status(200).send({
      success: true
    })
  } catch (err) {
    logger.error(err)
    return res.status(400).send({
      success: false,
      errors: [
        `Failed to delete webhook: ${err.message ? err.message : 'Check logs'}`
      ]
    })
  }
})

router.post('/__clearQueue', webhookAuthMiddleware, async (req, res) => {
  const cleared = await clearOutstandingQueue()

  res.send(200).status({
    success: cleared,
    message: cleared ? 'Success' : 'Check logs for error details'
  })
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

router.post('/', telegramIPWhitelistMiddleware, async (req, res) => {
  const message = req.body.message

  if (!message) {
    logger.error('No message in response??', res.body)
    res.send(200).end()
    return
  }

  await processMessage({
    message,
    onReplyMessage: (chatId, message) => {
      replyWithMessage(res, chatId, message)
    },
    onEndResponse: () => {
      res.send(200).end()
    }
  })
})

module.exports = router
