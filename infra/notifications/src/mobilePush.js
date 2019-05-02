// const { messageTemplates } = require('../templates/messageTemplates')
const Identity = require('../../identity/src/models').Identity
const { messageTemplates } = require('../templates/messageTemplates')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const apn = require('apn')
const firebase = require('firebase-admin')
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
    production: process.env.APNS_PRODUCTION === 'true' ? true : false
  })
  apnBundle = process.env.APNS_BUNDLE_ID
} else {
  logger.warn('APN provider not configured, no key file found')
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
} else {
  logger.warn('Firebase messaging not configured, no service JSON found')
}

//
// Mobile Push notifications for Messages
//
async function messageMobilePush(receivers, sender, config) {
  if (!receivers) throw 'receivers not defined'
  if (!sender) throw 'sender not defined'

  // TODO: Move to config
  const payload = {
    url: config.dappMessagesUrl
  }

  // Get ID of sender
  const messageSender = Identity.findOne({
    raw: true,
    where: {
      ethAddress: sender
    }
  })
  // Get IDs of recepients
  const messageReceivers = Identity.findAll({
    raw: true,
    where: {
      ethAddress: {
        [Op.or]: receivers
      }
    }
  })
  Promise.all([messageSender, messageReceivers]).then(
    ([senderIdentity, receiversIdentities]) => {
      receiversIdentities.forEach(async s => {
        try {
          const message = messageTemplates.message['mobile']['messageReceived']
          const ethAddress = s.ethAddress
          const notificationObj = {
            message: message,
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
              notificationObj
            )
          } else {
            logger.info(
              `No device registered for notifications for ${ethAddress}`
            )
          }
        } catch (error) {
          logger.error(`Could not email via Sendgrid: ${error}`)
        }
      })
    }
  )
}

//
// Mobile Push notifications
//
async function transactionMobilePush(
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
  // TODO: This URL should dynamically change for staging/dev as email notifications
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
        logger.info(`Pushing transaction notification to ${ethAddress}`)
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
      const messageFingerprint = web3Utils.keccak256(JSON.stringify(notificationObj))

      // iOS notifications
      const notification = new apn.Notification({
        alert: notificationObj.message,
        sound: 'default',
        payload: notificationObj.payload,
        topic: apnBundle
      })
      await apnProvider.send(notification, deviceToken).then(result => {
        if (result.sent.length) {
          NotificationLog.create({
            messageFingerprint: messageFingerprint,
            ethAddress: s.ethAddress,
            channel: 'mobile-ios'
          })
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
          NotificationLog.create({
            messageFingerprint: web3Utils.keccak256(JSON.stringify(notificationObj)),
            ethAddress: s.ethAddress,
            channel: 'mobile-android'
          })
          logger.debug('FCM message sent:', response)
        })
        .catch(error => {
          logger.error('FCM message failed to send: ', error)
        })
    }
  }
}

module.exports = { transactionMobilePush, messageMobilePush }
