const apn = require('apn')
const firebase = require('firebase-admin')
const web3Utils = require('web3-utils')

const { getNotificationMessage } = require('./notification')
const logger = require('./logger')
const MobileRegistry = require('./models').MobileRegistry

// Configure the APN provider
let apnProvider, apnBundle
if (process.env.APNS_KEY_FILE) {
  try {
    apnProvider = new apn.Provider({
      token: {
        key: process.env.APNS_KEY_FILE,
        keyId: process.env.APNS_KEY_ID,
        teamId: process.env.APNS_TEAM_ID
      },
      production: process.env.APNS_PRODUCTION === 'true' ? true : false
    })
    apnBundle = process.env.APNS_BUNDLE_ID
  } catch (error) {
    logger.error(`Error trying to configure apnProvider: ${error}`)
  }
} else {
  logger.warn('APN provider not configured.')
}

// Firebase Admin SDK
// ref: https://firebase.google.com/docs/reference/admin/node/admin.messaging
let firebaseMessaging
if (process.env.FIREBASE_SERVICE_JSON) {
  try {
    const firebaseServiceJson = require(process.env.FIREBASE_SERVICE_JSON)

    firebase.initializeApp({
      credential: firebase.credential.cert(firebaseServiceJson),
      databaseURL: process.env.FIREBASE_DB_URL
    })

    firebaseMessaging = firebase.messaging()
  } catch (error) {
    logger.error(`Error trying to configure firebaseMessaging: ${error}`)
  }
} else {
  logger.warn('Firebase messaging not configured.')
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
  const payload = {
    url: offer && `${dappOfferUrl}${offer.id}`
  }

  if (buyerMessage || sellerMessage) {
    if (buyerMessage) {
      receivers[buyerAddress] = {
        message: buyerMessage,
        payload
      }
    }
    if (sellerMessage) {
      receivers[sellerAddress] = {
        message: sellerMessage,
        payload
      }
    }

    for (const [_ethAddress, notificationObj] of Object.entries(receivers)) {
      const ethAddress = web3Utils.toChecksumAddress(_ethAddress)
      const mobileRegister = await MobileRegistry.findOne({
        where: { ethAddress, deleted: false, 'permissions.alert': true }
      })
      if (mobileRegister) {
        logger.info(`Sending notification to ${ethAddress}`)
        await sendNotification(
          mobileRegister.deviceToken,
          mobileRegister.deviceType,
          notificationObj
        )
      } else {
        logger.info(`No device registered for notifications for ${ethAddress}`)
      }
    }
  }
}

/* Send the notification depending on the type of notification (FCM or APN)
 *
 */
async function sendNotification(deviceToken, deviceType, notificationObj) {
  if (notificationObj) {
    if (deviceType === 'APN') {
      if (!apnProvider) {
        logger.error('APN provider not configured, notification failed')
        return
      }
      // iOS notifications
      const notification = new apn.Notification({
        alert: notificationObj.message,
        sound: 'default',
        payload: notificationObj.payload,
        topic: apnBundle
      })
      await apnProvider.send(notification, deviceToken).then(result => {
        if (result.sent.length) {
          logger.debug('APN sent: ', result.sent.length)
        }
        if (result.failed) {
          logger.error('APN failed: ', result.failed)
        }
      })
    } else if (deviceType === 'FCM') {
      if (!firebaseMessaging) {
        logger.error('Firebase messaging not configured, notification failed')
        return
      }
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
          ...notificationObj.message
        },
        data: notificationObj.payload,
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
