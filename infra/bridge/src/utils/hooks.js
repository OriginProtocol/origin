'use strict'

/**
 * Returns the host of the bridge
 * For webhooks on `development` environment, returns the tunnel host
 */
function getHost() {
  const HOST =
    process.env.NODE_ENV === 'development'
      ? process.env.WEBHOOK_TUNNEL_HOST
      : process.env.HOST

  return HOST
}

/**
 * Returns the webhook endpoint
 * @param {String} service Can be twitter/telegram
 */
function getWebhookURL(service) {
  return `https://${getHost()}/hooks/${service.toLowerCase()}`
}

/**
 * Returns the consumer key to be used for webhooks
 */
function getTwitterWebhookConsumerKey() {
  return (
    process.env.TWITTER_WEBHOOKS_CONSUMER_KEY ||
    process.env.TWITTER_CONSUMER_KEY
  )
}

/**
 * Returns the consumer secret to be used for webhooks
 */
function getTwitterWebhookConsumerSecret() {
  return (
    process.env.TWITTER_WEBHOOKS_CONSUMER_SECRET ||
    process.env.TWITTER_CONSUMER_SECRET
  )
}

module.exports = {
  getHost,
  getWebhookURL,
  getTwitterWebhookConsumerKey,
  getTwitterWebhookConsumerSecret
}
