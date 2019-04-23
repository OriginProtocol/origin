const apn = require('apn')
const firebase = require('firebase-admin')
const path = require('path')
const web3Utils = require('web3-utils')

const { getNotificationMessage } = require('./notification')
const logger = require('./logger')
const MobileRegistry = require('./models').MobileRegistry

// Configure the APN provider
let apnProvider, apnBundle
if (process.env.APNS_KEY_FILE) {
  apnProvider = new apn.Provider({
    token: {
      key: process.env.APNS_KEY_FILE,
      keyId: process.env.APNS_KEY_ID,
      teamId: process.env.APNS_TEAM_ID
    },
    production: process.env.APNS_PRODUCTION ? true : false
  })
  apnBundle = process.env.APNS_BUNDLE_ID
}

// Firebase Admin SDK
// ref: https://firebase.google.com/docs/reference/admin/node/admin.messaging
let firebaseMessaging
if (process.env.FIREBASE_SERVICE_JSON) {
  const firebaseServiceJson = require(process.env.FIREBASE_SERVICE_JSON)

  firebase.initializeApp({
    credential: firebase.credential.cert(firebaseServiceJson),
    databaseURL: process.env.FIREBASE_DB_URL
  })

  firebaseMessaging = firebase.messaging()
}

//
//
// Mobile Push notifications
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
  const dappOfferUrl =
    process.env.DAPP_OFFER_URL || 'https://dapp.originprotocol.com/#/purchases/'
  const eventData = {
    url: offer && path.join(dappOfferUrl, offer.id),
    toDapp: true
  }

  if (buyerMessage || sellerMessage) {
    if (buyerMessage) {
      receivers[buyerAddress] = Object.assign(
        { message: buyerMessage },
        eventData
      )
    }
    if (sellerMessage) {
      receivers[sellerAddress] = Object.assign(
        { message: sellerMessage },
        eventData
      )
    }

    for (const [_ethAddress, notificationObj] of Object.entries(receivers)) {
      const ethAddress = web3Utils.toChecksumAddress(_ethAddress)
      const mobileRegister = await MobileRegistry.findOne({
        where: { ethAddress }
      })
      await sendNotification(
        mobileRegister.deviceToken,
        mobileRegister.deviceType,
        notificationObj
      )
    }
  }
}

/* Send the notification depending on the type of notification (FCM or APN)
 *
 */
async function sendNotification(deviceToken, deviceType, notificationObj) {
  if (notificationObj) {
    if (deviceType === 'APN' && apnProvider) {
      // iOS notifications
      const notification = new apn.Notification({
        alert: notificationObj.message,
        sound: 'default',
        payload: notificationObj.data,
        topic: apnBundle
      })
      await apnProvider.send(notification, deviceToken).then(result => {
        logger.debug('APNS sent: ', result.sent.length)
        logger.error('APNS failed: ', result.failed)
      })
    } else if (deviceType === 'FCM' && firebaseMessaging) {
      // FCM notifications
      // Message: https://firebase.google.com/docs/reference/admin/node/admin.messaging.Message
      const message = {
        android: {
          priority: 'high',
          notification: {
            channelId: 'Dapp'
          }
        },
        notification: {
          title: 'Origin Marketplace Notification',
          body: notificationObj.message
        },
        data: notificationObj.data,
        token: deviceToken
      }

      await firebaseMessaging
        .send(message)
        .then(response => {
          logger.debug('FCM message sent:', response)
        })
        .catch(error => {
          logger.error('FCM message failed to send: ', error)
        })
    }
  }
}

module.exports = { mobilePush }
