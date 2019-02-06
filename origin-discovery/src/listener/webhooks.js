const http = require('http')
const https = require('https')
const urllib = require('url')

const logger = require('./logger')

/**
 * Posts a to discord channel via webhook.
 * This functionality should move out of the listener
 * to the notification system, as soon as we have one.
 */
async function postToDiscordWebhook (discordWebhookUrl, data) {
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
  await postToWebhook(discordWebhookUrl, JSON.stringify(discordData))
}

/**
 * Sends a blob of json to a webhook.
 */
async function postToWebhook (urlString, json) {
  const url = new urllib.URL(urlString)
  const postOptions = {
    host: url.hostname,
    port: url.port,
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json)
    }
  }
  return new Promise((resolve, reject) => {
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
    req.write(json)
    req.end()
  })
}

module.exports = { postToDiscordWebhook, postToWebhook }
