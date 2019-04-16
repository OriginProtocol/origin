const linkingNotifyEndpoint = process.env.LINKING_NOTIFY_ENDPOINT
const linkingNotifyToken = process.env.LINKING_NOTIFY_TOKEN
const { getNotificationMessage } = require('./notification')
const dappOfferUrl = process.env.DAPP_OFFER_URL
const fetch = require('cross-fetch')
const path = require('path')
const logger = require('./logger')

//
// Mobile Push (linker) notifications
//
async function mobilePush(
  eventName,
  party,
  buyerAddress,
  sellerAddress,
  offer
) {
  if (!eventName) throw 'eventName not defined'
  if (!party) throw 'party not defined'
  if (!buyerAddress) throw 'buyerAddress not defined'
  if (!sellerAddress) throw 'sellerAddress not defined'
  if (!offer) throw 'offer not defined'

  if (linkingNotifyEndpoint) {
    const receivers = {}
    const buyerMessage = getNotificationMessage(
      eventName,
      party,
      buyerAddress,
      'buyer',
      'mobile'
    )
    const sellerMessage = getNotificationMessage(
      eventName,
      party,
      sellerAddress,
      'seller',
      'mobile'
    )
    const eventData = {
      url: offer && path.join(dappOfferUrl, offer.id),
      to_dapp: true
    }

    if (buyerMessage || sellerMessage) {
      if (buyerMessage) {
        receivers[buyerAddress] = Object.assign(
          { msg: buyerMessage },
          eventData
        )
      }
      if (sellerMessage) {
        receivers[sellerAddress] = Object.assign(
          { msg: sellerMessage },
          eventData
        )
      }
      try {
        // POST to linking server
        fetch(linkingNotifyEndpoint, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ receivers, token: linkingNotifyToken })
        })
      } catch (error) {
        logger.error('Error notifying linking api ', error)
      }
    }
  }
}

module.exports = { mobilePush }
