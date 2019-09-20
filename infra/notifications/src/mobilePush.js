const apn = require('apn')
const firebase = require('firebase-admin')
const Sequelize = require('sequelize')
const web3Utils = require('web3-utils')

const Identity = require('../../identity/src/models').Identity
const MobileRegistry = require('./models').MobileRegistry
const { messageTemplates } = require('../templates/messageTemplates')
const { getNotificationMessage } = require('./notification')
const logger = require('./logger')

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

/**
 * Sends a mobile push notification to an Android or iOS device.
 *
 * @param {string} deviceToken
 * @param {string} deviceType: 'APN' or 'FCM'
 * @param {{message: {title:string, body:string}, payload: Object}} notificationObj
 * @param {string} ethAddress: Eth address, lower cased.
 * @param {string} messageHash: Hash of the origin message.
 * @param {Object} config: Notification server configuration.
 * @returns {Promise<void>}
 * @private
 */
async function _sendNotification(
  deviceToken,
  deviceType,
  notificationObj,
  ethAddress,
  messageHash,
  config
) {
  if (!notificationObj) {
    throw new Error('Missing notificationObj')
  }
  if (!['APN', 'FCM'].includes(deviceType)) {
    throw new Error(`Invalid device type ${deviceType}`)
  }

  const notificationObjAndHash = { ...notificationObj, messageHash }
  const messageFingerprint = getMessageFingerprint(notificationObjAndHash)
  if (deviceType === 'APN') {
    if (!apnProvider) {
      throw new Error('APN provider not configured, notification failed')
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
        await logNotificationSent(messageFingerprint, ethAddress, 'mobile-ios')
        logger.debug('APN sent: ', result.sent.length)
      }
      if (result.failed) {
        logger.error('APN failed: ', result.failed)
      }
    })
  } else if (deviceType === 'FCM') {
    if (!firebaseMessaging) {
      throw new Error('Firebase messaging not configured, notification failed')
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

/**
 * Sends a mobile push notification to all the devices registered under
 * a give Eth address.
 *
 * @param {string} ethAddress: Eth address. Lower cased.
 * @param {{message: {title:string, body:string}, payload: Object}} notificationObj
 * @param {Object} config: Notification server config.
 * @returns {Promise<void>}
 * @private
 */
async function _sendNotificationToEthAddress(
  ethAddress,
  notificationObj,
  config
) {
  try {
    const mobileRegisters = await MobileRegistry.findAll({
      where: {
        ethAddress: ethAddress,
        deviceToken: { [Sequelize.Op.ne]: null },
        deleted: false,
        'permissions.alert': true
      },
      order: [['updatedAt', 'DESC']] // Most recently updated records first.
    })
    if (mobileRegisters.length === 0) {
      logger.info(
        `No device registered with notification enabled for ${ethAddress}`
      )
      return
    }

    for (const mobileRegister of mobileRegisters) {
      await _sendNotification(
        mobileRegister.deviceToken,
        mobileRegister.deviceType,
        notificationObj,
        ethAddress,
        null,
        config
      )
    }
  } catch (error) {
    logger.error(`Push notification failure for ${ethAddress}: ${error}`)
  }
}

/**
 * Sends a mobile push notifications to users to let them know they
 * received a new Message in Origin messaging.
 * @param {Array<string>} receivers: List of receivers Eth address.
 * @param {string} sender: Eth address of the sender of the message.
 * @param {string} messageHash: Hash of the message
 * @param {Object} config: Notification server configuration.
 * @returns {Promise<void>}
 */
async function messageMobilePush(receivers, sender, messageHash, config) {
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

  const senderIdentity = Identity.findOne({
    where: {
      ethAddress: sender
    }
  })

  // Send a notification to each receiver.
  for (const receiver of receivers) {
    const senderName =
      senderIdentity !== null &&
      senderIdentity.firstName &&
      senderIdentity.lastName
        ? `${senderIdentity.firstName || ''} ${senderIdentity.lastName ||
            ''} (${web3Utils.toChecksumAddress(sender)})`
        : web3Utils.toChecksumAddress(sender)

    const templateVars = {
      config,
      sender,
      senderName,
      dappUrl: config.dappUrl,
      ipfsGatewayUrl: config.ipfsGatewayUrl
    }

    const messageTemplate =
      messageTemplates.message['mobile']['messageReceived']
    // Apply template
    const message = {
      title: messageTemplate.title(templateVars),
      body: messageTemplate.body(templateVars)
    }
    const ethAddress = receiver
    const notificationObj = {
      message,
      payload
    }

    await _sendNotificationToEthAddress(ethAddress, notificationObj, config)
  }
}

/**
 * Sends a mobile push notification to a buyer or seller to notify them
 * that the state of their offer changed.
 *
 * @param {string} eventName: Name of the event. Example: OfferCreated, OfferAccepted, ...
 * @param {string} party: Either the buyer or the seller Eth address.
 * @param {string} buyerAddress: Buyer's Eth address.
 * @param {string} sellerAddress: Seller's Eth address.
 * @param {Object} offer: Offer object.
 * @param {Object} listing: Listing object
 * @param {Object} config: Notification server configuration.
 * @returns {Promise<void>}
 */
async function transactionMobilePush(
  eventName,
  party,
  buyerAddress,
  sellerAddress,
  offer,
  listing,
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
  const buyerMessageTemplate = getNotificationMessage(
    eventName,
    party,
    buyerAddress,
    'buyer',
    'mobile'
  )
  const sellerMessageTemplate = getNotificationMessage(
    eventName,
    party,
    sellerAddress,
    'seller',
    'mobile'
  )
  const payload = {
    url: offer && `${config.dappUrl}/#/purchases/${offer.id}`
  }

  const templateVars = {
    listing,
    offer,
    config,
    dappUrl: config.dappUrl,
    ipfsGatewayUrl: config.ipfsGatewayUrl
  }

  if (buyerMessageTemplate || sellerMessageTemplate) {
    if (buyerMessageTemplate) {
      receivers[buyerAddress] = {
        message: {
          title: buyerMessageTemplate.title(templateVars),
          body: buyerMessageTemplate.body(templateVars)
        },
        payload
      }
    }
    if (sellerMessageTemplate) {
      receivers[sellerAddress] = {
        message: {
          title: sellerMessageTemplate.title(templateVars),
          body: sellerMessageTemplate.body(templateVars)
        },
        payload
      }
    }

    for (const [ethAddress, notificationObj] of Object.entries(receivers)) {
      await _sendNotificationToEthAddress(ethAddress, notificationObj, config)
    }
  }
}

module.exports = { transactionMobilePush, messageMobilePush }
