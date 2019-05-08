const { messageTemplates } = require('../templates/messageTemplates')

const apn = require('apn')
const firebase = require('firebase-admin')
const web3Utils = require('web3-utils')

const { getNotificationMessage } = require('./notification')
const logger = require('./logger')
const MobileRegistry = require('./models').MobileRegistry

const {
  getMessageFingerprint,
  isNotificationDupe,
  logNotificationSent
} = require('./dupeTools')

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
// Mobile Push notifications for Messages
//
async function messageMobilePush(receivers, sender, config) {
  if (!receivers) throw new Error('receivers not defined')
  if (!sender) throw new Error('sender not defined')

  // Force lowercase
  sender = sender.toLowerCase()
  receivers = receivers.map(function(r) {
    return r.toLowerCase()
  })

  const payload = {
    url: `${config.dappUrl}/#/messages`
  }

  receivers.forEach(async receiver => {
    try {
      // TODO: Turn mobile messages into templates
      const message = messageTemplates.message['mobile']['messageReceived']
      const ethAddress = receiver
      const notificationObj = {
        message,
        payload
      }

      // Push the message
      const mobileRegister = await MobileRegistry.findOne({
        where: { ethAddress, deleted: false, 'permissions.alert': true }
      })
      if (mobileRegister) {
        logger.info(`Pushing message notification to ${ethAddress}`)
        await sendNotification(
          mobileRegister.deviceToken,
          mobileRegister.deviceType,
          notificationObj,
          ethAddress,
          config
        )
      } else {
        logger.info(
          `Message: No device registered for notifications for ${ethAddress}`
        )
      }
    } catch (error) {
      logger.error(`Could not send push notification: ${error}`)
    }
  })
}

//
// Mobile Push notifications
//
async function transactionMobilePush(
  eventName,
  party,
  buyerAddress,
  sellerAddress,
  offer,
  config
) {
  if (!eventName) throw new Error('eventName not defined')
  if (!party) throw new Error('party not defined')
  if (!buyerAddress) throw new Error('buyerAddress not defined')
  if (!sellerAddress) throw new Error('sellerAddress not defined')
  if (!offer) throw new Error('offer not defined')

  // Force lowercase
  buyerAddress = buyerAddress.toLowerCase()
  sellerAddress = sellerAddress.toLowerCase()
  party = party.toLowerCase()

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
  const payload = {
    url: offer && `${config.dappUrl}/#/purchases/${offer.id}`
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
        logger.info(`Pushing transaction notification to ${ethAddress}`)
        await sendNotification(
          mobileRegister.deviceToken,
          mobileRegister.deviceType,
          notificationObj,
          ethAddress,
          config
        )
      } else {
        logger.info(
          `Transaction: No device registered for notifications for ${ethAddress}`
        )
      }
    }
  }
}

/* Send the notification depending on the type of notification (FCM or APN)
 *
 */
async function sendNotification(
  deviceToken,
  deviceType,
  notificationObj,
  ethAddress,
  config
) {
  if (notificationObj) {
    const messageFingerprint = getMessageFingerprint(notificationObj)
    if (deviceType === 'APN') {
      if (!apnProvider) {
        logger.error('APN provider not configured, notification failed')
        return
      }

      if ((await isNotificationDupe(messageFingerprint, config)) > 0) {
        logger.warn(`Duplicate. Notification already recently sent. Skipping.`)
        return
      }

      // iOS notifications
      const notification = new apn.Notification({
        alert: notificationObj.message,
        sound: 'default',
        payload: notificationObj.payload,
        topic: apnBundle
      })
      await apnProvider.send(notification, deviceToken).then(async result => {
        if (result.sent.length) {
          await logNotificationSent(
            messageFingerprint,
            ethAddress,
            'mobile-ios'
          )
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
        .then(async response => {
          await logNotificationSent(
            messageFingerprint,
            ethAddress,
            'mobile-android'
          )
          logger.debug('FCM message sent:', response)
        })
        .catch(error => {
          logger.error('FCM message failed to send: ', error)
        })
    }
  }
}

module.exports = { transactionMobilePush, messageMobilePush }
