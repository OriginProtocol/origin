const http = require('http')
const https = require('https')
const urllib = require('url')
const { PubSub } = require('@google-cloud/pubsub')

const logger = require('./logger')

/**
 * Posts a to discord channel via webhook.
 * This functionality should move out of the listener
 * to the notification system, as soon as we have one.
 */
async function postToDiscordWebhook(url, data) {
  const eventIcons = {
    ListingCreated: ':trumpet:',
    ListingUpdated: ':saxophone:',
    ListingWithdrawn: ':x:',
    ListingData: ':cd:',
    ListingArbitrated: ':boxing_glove:',
    OfferCreated: ':baby_chick:',
    OfferWithdrawn: ':feet:',
    OfferAccepted: ':bird:',
    OfferDisputed: ':dragon_face:',
    OfferRuling: ':dove:',
    OfferFinalized: ':unicorn:',
    OfferData: ':beetle:'
  }

  const personDisp = p => {
    let str = ''
    if (p.profile && (p.profile.firstName || p.profile.lastName)) {
      str += `${p.profile.firstName || ''} ${p.profile.lastName || ''} - `
    }
    str += p.address
    return str
  }
  const priceDisp = listing => {
    const price = listing.price
    return price ? `${price.amount}${price.currency}` : ''
  }

  const icon = eventIcons[data.log.eventName] || ':dromedary_camel: '
  const listing = data.related.listing

  let discordData = {}

  if (data.related.offer !== undefined) {
    // Offer
    discordData = {
      embeds: [
        {
          title: `${icon} ${data.log.eventName} - ${
            listing.title
          } - ${priceDisp(listing)}`,
          description: [
            `https://dapp.originprotocol.com/#/purchases/${
              data.related.offer.id
            }`,
            `Seller: ${personDisp(data.related.seller)}`,
            `Buyer: ${personDisp(data.related.buyer)}`
          ].join('\n')
        }
      ]
    }
  } else {
    // Listing
    discordData = {
      embeds: [
        {
          title: `${icon} ${data.log.eventName} - ${
            listing.title
          } - ${priceDisp(listing)}`,
          description: [
            `${listing.description.split('\n')[0].slice(0, 60)}...`,
            `https://dapp.originprotocol.com/#/listing/${listing.id}`,
            `Seller: ${personDisp(data.related.seller)}`
          ].join('\n')
        }
      ]
    }
  }
  await postToWebhook(url, JSON.stringify(discordData))
}

/**
 * Triggers on Identity event to add the user's email to
 * our global Origin mailing list.
 */
async function postToEmailWebhook(url, data) {
  const user = data.related.user
  if (!user.email) {
    logger.debug('No email present in identity, skipping email webhook.')
    return
  }

  const emailData = `email=${encodeURIComponent(user.email)}&dapp_user=1`
  await postToWebhook(url, emailData, 'application/x-www-form-urlencoded')
}

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

/**
 * Sends a blob of data to a Google Cloud pubsub topic.
 */
async function publishToGcloudPubsub(projectId, topic, data) {
  const pubsub = new PubSub({
    projectId: projectId,
    keyFilename: process.env.GCLOUD_SERVICE_ACCOUNT_JSON
  })

  return await pubsub.topic(topic).publish(Buffer.from(JSON.stringify(data)))
}

module.exports = {
  postToEmailWebhook,
  postToDiscordWebhook,
  postToWebhook,
  publishToGcloudPubsub
}
