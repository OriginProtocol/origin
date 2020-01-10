'use strict'

const request = require('superagent')

const logger = require('../logger')

const processMessage = require('../utils/process-telegram-message')

const HOST =
  process.env.NODE_ENV === 'development'
    ? process.env.WEBHOOK_TUNNEL_HOST
    : process.env.HOST

const Bottleneck = require('bottleneck')

/**
 * Subscribes to the webhook events
 */
async function subscribeToHooks() {
  const webhookURL = encodeURIComponent(`https://${HOST}/hooks/telegram`)

  const registerURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookURL}&max_connections=100&allowed_updates=%5B%22message%22%5D`

  const response = await request.get(registerURL)

  if (!response.body.ok) {
    throw response.body
  }

  if (response.body.result === true) {
    logger.debug(
      `Webhook already live on the URL: ${decodeURIComponent(webhookURL)}`
    )
    return
  }

  logger.debug(`Webhook is live on ${response.body.result.url}`)
}

async function deleteWebhook() {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/deleteWebhook`

  const response = await request.post(url)

  if (!response.body.ok) {
    throw response.body.description
  }

  if (response.body.result === true) {
    logger.warn('Telegram Webhook deleted')
    return
  }

  logger.error('Failed to delete webhook', response.body)

  throw response.body
}

async function getUpdates(offset) {
  const url = `https://api.telegram.org/bot${
    process.env.TELEGRAM_BOT_TOKEN
  }/getUpdates${offset ? '?offset=' + offset : ''}`

  const response = await request.get(url)

  return response.body
}

async function getWebhookInfo() {
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getWebhookInfo`

  const response = await request.get(url)

  return response.body
}

async function clearOutstandingQueue() {
  let i = 0
  let lastUpdateID
  try {
    while (i < 100) {
      // Limiting to 10k messages per request
      i++
      const data = await getUpdates(lastUpdateID)
      if (data.result.length <= 10) {
        break
      }
      lastUpdateID = data.result[data.result.length - 1].update_id
    }

    return true
  } catch (err) {
    logger.error('Failed to clear outstanding queue', err)
    return false
  }
}

async function sendMessage(chatID, message) {
  logger.debug('Sending message to chat', chatID, message)
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`

  const response = await request
    .post(url)
    .set('Content-Type', 'application/json')
    .send({
      method: 'sendMessage',
      chat_id: chatID,
      text: message
    })

  return response.body
}

let pollRunning = false
let pollingAborted
let lastUpdateID

async function poller() {
  const pollInterval = process.env.TELEGRAM_POLL_INTERVAL || 2000

  // Telegram has a rate limit of 30 requests per second fot bots
  const reqBottleneck = new Bottleneck({ minTime: 3330 })

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (pollingAborted) {
      logger.info('Polling aborted, terminating process')
      lastUpdateID = null
      pollRunning = false
      pollingAborted = false
      break
    }

    await new Promise(resolve => setTimeout(resolve, pollInterval))

    try {
      const updates = await getUpdates(lastUpdateID ? lastUpdateID + 1 : null)

      logger.debug(
        `Received ${updates.result.length} updates from telegram with offset ${
          lastUpdateID ? lastUpdateID + 1 : '-'
        }`
      )

      if (updates.result.length === 0) {
        continue
      }

      lastUpdateID = updates.result[updates.result.length - 1].update_id

      for (const upd of updates.result) {
        if (upd.message) {
          processMessage({
            message: upd.message,
            onReplyMessage: (chatID, message) => {
              logger.debug('Scheduling reply message for chat', chatID, message)
              reqBottleneck.schedule(() => sendMessage(chatID, message))
            }
          })
        }
      }
    } catch (err) {
      logger.error('Error while getting updates from telegram', err)
    }
  }
}

async function startPollingFallback() {
  if (pollRunning) return

  logger.debug('Starting to poll for updates...')

  try {
    // getUpdates won't work when webhook is active
    // Try to delete webhook
    await deleteWebhook()
  } catch (err) {
    // Most likely, no webhook
    logger.error('Failed to delete webhook', err)
  }

  pollingAborted = false
  pollRunning = true

  poller()

  logger.debug('Telegram poller stated')
}

const cancelPolling = () => {
  logger.debug('Aborting telegram updates polling...')
  if (!pollingAborted) {
    pollingAborted = true
  }
}

module.exports = {
  subscribeToHooks,
  deleteWebhook,
  getUpdates,
  getWebhookInfo,
  clearOutstandingQueue,
  sendMessage,
  startPollingFallback,
  cancelPolling
}
