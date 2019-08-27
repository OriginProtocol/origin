const http = require('http')
const https = require('https')
const urllib = require('url')

const logger = require('../logger')

/**
 * Sends a blob of data to a webhook.
 */
async function postToWebhook(
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

module.exports = { postToWebhook }
