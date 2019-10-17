'use strict'

const http = require('http')
const https = require('https')
const urllib = require('url')
const { PubSub } = require('@google-cloud/pubsub')

const logger = require('./logger')


async function pinIdentityToIpfs(identity) {
  const projectId = process.env.GCLOUD_PROJECT_ID
  const topic = process.env.GCLOUD_PUBSUB_TOPIC
  const pubsub = new PubSub({
    projectId,
    keyFilename: process.env.GCLOUD_SERVICE_ACCOUNT_JSON
  })

  return await pubsub.topic(topic).publish(Buffer.from(JSON.stringify(identity)))
}

/**
 * Sends a blob of data to a webhook.
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
 * Triggers on Identity event to add the user's email to
 * our global Origin mailing list.
 */
async function postToEmailWebhook(identity) {
  const url = process.env.EMAIL_WEBHOOK
  if (!identity.email) {
    logger.warn('No email present in identity, skipping email webhook.')
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