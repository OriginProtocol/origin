const apn = require('apn')
const firebase = require('firebase-admin')
const Sequelize = require('sequelize')
const web3Utils = require('web3-utils')

const Identity = require('@origin/identity/src/models').Identity
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
      production: process.env.APNS_PRODUCTION === 'true'
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

class MobilePush {
  /**
   * Constructor
   * @param {Object} config: Notification server configuration.
   */
  constructor(config) {
    this.config = config
  }

  /**
   * Sends a mobile push notification to an Android or iOS device.
   *
   * @param {string} deviceToken
   * @param {string} deviceType: 'APN' or 'FCM'
   * @param {{message: {title:string, body:string}, payload: Object}} notificationObj
   * @param {string} ethAddress: Eth address, lower cased.
   * @param {string} messageHash: Optional. Hash of the origin message.
   * @returns {Promise<void>}
   * @private
   */
  async _send(
    deviceToken,
    deviceType,
    notificationObj,
    ethAddress,
    messageHash
  ) {
    if (!notificationObj) {
      throw new Error('Missing notificationObj')
    }
    if (!['APN', 'FCM'].includes(deviceType)) {
      throw new Error(`Invalid device type ${deviceType}`)
    }

    // Check we are not spamming the user.
    const notificationObjAndHash = { ...notificationObj, messageHash }
    const messageFingerprint = getMessageFingerprint(notificationObjAndHash)
    if ((await isNotificationDupe(messageFingerprint, this.config)) > 0) {
      logger.warn(`Duplicate. Notification already recently sent. Skipping.`)
      return
    }

    // Do not send notification during unit tests.
    const isTest = process.env.NODE_ENV === 'test'
    let success = isTest

    if (deviceType === 'APN' && !isTest) {
      if (!apnProvider) {
        throw new Error('APN provider not configured, notification failed')
      }

      const notification = new apn.Notification({
        alert: notificationObj.message,
        sound: 'default',
        payload: notificationObj.payload,
        topic: apnBundle
      })

      try {
        const response = await apnProvider.send(notification, deviceToken)
        if (response.sent.length) {
          success = true
          logger.debug('APN sent: ', response.sent.length)
        }
        if (response.failed) {
          logger.error('APN failed: ', response.failed)
        }
      } catch (error) {
        logger.error('APN message failed to send: ', error)
      }
    } else if (deviceType === 'FCM' && !isTest) {
      if (!firebaseMessaging) {
        throw new Error(
          'Firebase messaging not configured, notification failed'
        )
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

      try {
        const response = await firebaseMessaging.send(message)
        logger.debug('FCM message sent:', response)
        success = true
      } catch (error) {
        logger.error('FCM message failed to send: ', error)
      }
    }
    if (success) {
      await logNotificationSent(
        messageFingerprint,
        ethAddress,
        deviceType === 'APN' ? 'mobile-ios' : 'mobile-android'
      )
    }
  }

  /**
   * Sends a mobile push notification to all the devices registered under
   * a give Eth address.
   *
   * @param {string} ethAddress: Eth address. Lower cased.
   * @param {{message: {title:string, body:string}, payload: Object}} notificationObj
   * @param {string} messageHash: Optional. Hash of the origin message.
   * @returns {Promise<void>}
   * @private
   */
  async _sendToEthAddress(ethAddress, notificationObj, messageHash) {
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
        await this._send(
          mobileRegister.deviceToken,
          mobileRegister.deviceType,
          notificationObj,
          ethAddress,
          messageHash
        )
      }
    } catch (error) {
      logger.error(`Push notification failure for ${ethAddress}: ${error}`)
    }
  }

  /**
   * Sends a mobile push notifications to a list of receivers to let them
   * know they have a new Message in Origin messaging.
   *
   * @param {Array<string>} receivers: List of receivers Eth address.
   * @param {string} sender: Eth address of the sender of the message.
   * @param {string} messageHash: Hash of the Origin message
   * @returns {Promise<void>}
   */
  async sendMessageNotification(receivers, sender, messageHash) {
    if (!receivers) throw new Error('receivers not defined')
    if (!sender) throw new Error('sender not defined')

    // Force lowercase
    sender = sender.toLowerCase()
    receivers = receivers.map(r => r.toLowerCase())

    const payload = {
      url: `${this.config.dappUrl}/#/messages`
    }

    const senderIdentity = await Identity.findOne({
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
        config: this.config,
        sender,
        senderName,
        dappUrl: this.config.dappUrl,
        ipfsGatewayUrl: this.config.ipfsGatewayUrl
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

      await this._sendToEthAddress(ethAddress, notificationObj, messageHash)
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
   * @param {Object} listing: Listing object.
   * @returns {Promise<void>}
   */
  async sendMarketplaceNotification(
    eventName,
    party,
    buyerAddress,
    sellerAddress,
    offer,
    listing
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
    if (!(buyerMessageTemplate || sellerMessageTemplate)) {
      logger.info(`No template defined for ${eventName}. Skipping.`)
      return
    }

    const payload = {
      url: offer && `${this.config.dappUrl}/#/purchases/${offer.id}`
    }

    const templateVars = {
      listing,
      offer,
      config: this.config,
      dappUrl: this.config.dappUrl,
      ipfsGatewayUrl: this.config.ipfsGatewayUrl
    }

    const receivers = {}
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
      await this._sendToEthAddress(ethAddress, notificationObj, null)
    }
  }
}

module.exports = MobilePush
