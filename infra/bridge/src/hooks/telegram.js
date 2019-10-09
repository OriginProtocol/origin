'use strict'

const request = require('superagent')

const logger = require('./../logger')

const HOST =
  process.env.NODE_ENV === 'development'
    ? process.env.WEBHOOK_TUNNEL_HOST
    : process.env.HOST

/**
 * Subscribes to the webhook events
 */
async function subscribeToHooks() {
  const webhookURL = encodeURIComponent(`https://${HOST}/hooks/telegram`)

  const registerURL = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/setWebhook?url=${webhookURL}`

  const response = await request.get(registerURL)

  if (!response.body.ok) {
    throw response.body
  }

  if (response.body.result === true) {
    logger.info(
      `Webhook already live on the URL: ${decodeURIComponent(webhookURL)}`
    )
    return
  }

  logger.info(`Webhook is live on ${response.body.result.url}`)
}

module.exports = {
  subscribeToHooks
}
