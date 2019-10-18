'use strict'

const http = require('http')
const https = require('https')
const urllib = require('url')
const { PubSub } = require('@google-cloud/pubsub')

const logger = require('../logger')

/**
 * Enqueues a message into a GCP pubsub queue for pinning content.
 *
 * @param {Object} identity
 * @returns {Promise<void>}
 */
async function pinIdentityToIpfs(identity) {
  // Bail out if we are in a test environment.
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Test environment. Skipping pubsub publish.')
    return
  }

  const projectId = process.env.GCLOUD_PROJECT_ID
  const topic = process.env.GCLOUD_PUBSUB_TOPIC
  const keyFilename = process.env.GCLOUD_SERVICE_ACCOUNT_JSON
  if (!projectId || !topic || !keyFilename) {
    logger.warn('Pubsub not configured. Skipping.')
    return
  }

  const data = {
    centralizedIdentity: true,
    event: {
      event: 'IdentityUpdated',
        returnValues: {
        ipfsHash: data.ipfsHash
      }
    },
    related: { identity: identity }
  }

  const pubsub = new PubSub({ projectId, keyFilename })
  await pubsub
    .topic(topic)
    .publish(Buffer.from(JSON.stringify(data)))
}

/**
 * Helper function to send a blob of data to a webhook.
 *
 * @param {string} urlString: URL to call.
 * @param {string} data: data to send.
 * @param {string} contentType
 * @returns {Promise<unknown>}
 * @private
 */
async function _postToWebhook(
  urlString,
  data,
  contentType = 'application/json'
) {
  const url = new urllib.URL(urlString)
  const postOptions = {
    host: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': contentType,
      'Content-Length': Buffer.byteLength(data)
    }
  }
  return new Promise((resolve, reject) => {
    logger.debug(`Calling webhook ${urlString}`)
    const client = url.protocol === 'https:' ? https : http
    const req = client.request(postOptions, res => {
      logger.debug(`Webhook response status code=${res.statusCode}`)
      if (res.statusCode === 200 || res.statusCode === 204) {
        resolve()
      } else {
        reject(new Error(`statusCode ${res.statusCode}`))
      }
    })
    req.on('error', err => {
      reject(err)
    })
    req.write(data)
    req.end()
  })
}

/**
 * Calls a webhook on a remote URL to register the user's basic information.
 * This can be used for example to add the user to an email distribution list.
 *
 * @param {{ethAddress:string, email:string, firstName: string, lastName: string}} identity
 * @returns {Promise<void>}
 */
async function postToEmailWebhook(identity) {
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Test environment. Skipping pubsub publish.')
    return
  }
  const url = process.env.EMAIL_WEBHOOK
  if (!url) {
    logger.warn('Email webhook not configured. Skipping')
    return
  }

  if (!identity.email) {
    logger.info('No email present in identity, skipping email webhook.')
    return
  }

  const emailData = `eth_address=${encodeURIComponent(
    identity.ethAddress
  )}&email=${encodeURIComponent(
    identity.email
  )}&first_name=${encodeURIComponent(
    identity.firstName || ''
  )}&last_name=${encodeURIComponent(
    identity.lastName || ''
  )}&phone=${encodeURIComponent(identity.phone || '')}&dapp_user=1`
  await _postToWebhook(url, emailData, 'application/x-www-form-urlencoded')
}

module.exports = { pinIdentityToIpfs, postToEmailWebhook }
