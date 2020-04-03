const apn = require('apn')
const Sequelize = require('sequelize')
const web3Utils = require('web3-utils')

const Identity = require('@origin/identity/src/models').Identity
const db = require('./models')
const MobileRegistry = db.MobileRegistry
const { messageTemplates } = require('../templates/messageTemplates')
const { getNotificationMessage } = require('./notification')
const logger = require('./logger')

const chunk = require('lodash/chunk')

const {
  getMessageFingerprint,
  isNotificationDupe,
  logNotificationSent
} = require('./dupeTools')

const firebaseMessaging = require('./utils/firebaseMessaging')

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
   * @param {[{deviceToken:string, ethAddress:string}]} registry
   * @param {string} deviceType: 'APN' or 'FCM'
   * @param {{message: {title:string, body:string}, payload: Object}} notificationObj
   * @param {string} messageHash: Optional. Hash of the origin message.
   * @returns {Promise<void>}
   * @private
   */
  async _rawSend(registry, deviceType, notificationObj, messageHash) {
    if (!notificationObj) {
      throw new Error('Missing notificationObj')
    }

    if (!['APN', 'FCM'].includes(deviceType)) {
      throw new Error(`Invalid device type ${deviceType}`)
    }

    const notificationObjAndHash = { ...notificationObj, messageHash }

    const channel = deviceType === 'APN' ? 'mobile-ios' : 'mobile-android'

    const filteredRegistry = registry
      .map(data => {
        const messageFingerprint = getMessageFingerprint({
          ...notificationObjAndHash,
          channel,
          ethAddress: data.ethAddress,
          deviceToken: data.deviceToken
        })

        return {
          ...data,
          messageFingerprint
        }
      })
      .filter(async data => {
        const { ethAddress, messageFingerprint } = data

        const dupeCount = await isNotificationDupe(
          messageFingerprint,
          this.config
        )

        if (dupeCount > 0) {
          logger.debug(
            `Duplicate. Notification already recently sent. Skipping.`,
            ethAddress,
            channel,
            messageFingerprint
          )
          return false
        }

        return true
      })

    if (filteredRegistry.length === 0) {
      logger.debug('No device tokens to send notifications')
      return
    }

    const filteredTokens = filteredRegistry.map(data => data.deviceToken)

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
        const response = await apnProvider.send(notification, filteredTokens)
        // response.sent: Array of device tokens to which the notification was sent successfully
        // response.failed: Array of objects containing the device token (`device`) and either
        if (response.sent.length) {
          success = true
          logger.debug('APN sent', JSON.stringify(response))
        } else {
          logger.error('APN send failure:', JSON.stringify(response))
        }
      } catch (error) {
        logger.error('APN send error: ', error)
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
        tokens: filteredTokens
      }

      try {
        const response = await firebaseMessaging.send(message)
        logger.debug('FCM message sent:', JSON.stringify(response))
        success = true
      } catch (error) {
        logger.error('FCM message failed to send: ', JSON.stringify(error))
      }
    }

    const promises = filteredRegistry.map(data => {
      logger.debug(`Sent notification to ${data.ethAddress} (${deviceType})`)
      return logNotificationSent(
        data.messageFingerprint,
        data.ethAddress,
        channel
      )
    })

    if (success) {
      await Promise.all(promises)
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
        const errorMsg = `No device registered with notification enabled for ${ethAddress}`
        logger.info(errorMsg)
        return {
          error: errorMsg
        }
      }

      for (const mobileRegister of mobileRegisters) {
        await this._rawSend(
          [{ deviceToken: mobileRegister.deviceToken, ethAddress }],
          mobileRegister.deviceType,
          notificationObj,
          messageHash
        )
      }
    } catch (error) {
      const errorMsg = `Push notification failure for ${ethAddress}: ${error}`
      logger.error(errorMsg)
      return {
        error: errorMsg
      }
    }

    return {
      ok: true
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

  async _sendInChunks(data, deviceType, mobileRegisters) {
    // NOTE: The send process won't resume if interrupted in the middle
    // The state of sent/unsent chunks isn't stored anywhere

    if (mobileRegisters.length === 0) {
      const errorMsg = `No device registered with notification enabled`
      logger.debug(errorMsg)
      return {
        error: errorMsg
      }
    }
    const { title, body, payload } = data

    const notificationObj = {
      message: {
        title,
        body
      },
      payload
    }

    const targets = mobileRegisters.map(register => {
      return {
        ethAddress: register.ethAddress,
        deviceToken: register.deviceToken
      }
    })

    // Send in chunks of 100
    const chunks = chunk(targets, 100)

    logger.debug(
      `Preparing to send notifcation to ${targets.length} ${deviceType} devices in ${chunks.length} chunks`
    )

    let chunkCount = 0
    try {
      for (const chunk of chunks) {
        logger.debug(`Sending chunk ${chunkCount++}/${chunks.length}`)
        await this._rawSend(chunk, deviceType, notificationObj)
      }
    } catch (error) {
      logger.error('Failed to send', error)
      return {
        error: error.message
      }
    }
  }

  async _sendToAllDevices(data, deviceType) {
    const mobileRegisters = await MobileRegistry.findAll({
      where: {
        deviceToken: { [Sequelize.Op.ne]: null },
        deviceType,
        deleted: false,
        'permissions.alert': true
      },
      order: [['updatedAt', 'DESC']] // Most recently updated records first.
    })

    logger.debug(`Found ${mobileRegisters.length} ${deviceType} devices`)

    await this._sendInChunks(data, deviceType, mobileRegisters)
  }

  async _sendToManyAddresses(data, deviceType, addresses) {
    const mobileRegisters = await MobileRegistry.findAll({
      where: {
        deviceToken: { [Sequelize.Op.ne]: null },
        deviceType,
        ethAddress: {
          [Sequelize.Op.in]: addresses.map(a => a.toLowerCase())
        },
        deleted: false,
        'permissions.alert': true
      },
      order: [['updatedAt', 'DESC']] // Most recently updated records first.
    })

    logger.debug(
      `Found ${mobileRegisters.length} ${deviceType} devices`,
      JSON.stringify(addresses.slice(0, 10))
    )

    await this._sendInChunks(data, deviceType, mobileRegisters)
  }

  async _sendToCountryCode(data, deviceType, countryCode) {
    const [addresses] = await db.sequelize.query(
      `
    select distinct iden.eth_address as address
      from identity iden, growth_event gevent 
      where gevent.eth_address=iden.eth_address 
        and gevent.type='MobileAccountCreated' 
        and iden.country=:countryCode
    `,
      {
        replacements: {
          countryCode
        }
      }
    )

    if (!addresses.length) {
      logger.error('There are no addresses from', countryCode)
      return
    }

    const mobileRegisters = await MobileRegistry.findAll({
      where: {
        deviceToken: { [Sequelize.Op.ne]: null },
        deviceType,
        ethAddress: {
          [Sequelize.Op.in]: addresses.map(a => a.address.toLowerCase())
        },
        deleted: false,
        'permissions.alert': true
      },
      order: [['updatedAt', 'DESC']] // Most recently updated records first.
    })

    logger.debug(`Found ${mobileRegisters.length} ${deviceType} devices`)

    await this._sendInChunks(data, deviceType, mobileRegisters)
  }

  async _sendToLangCode(data, deviceType, languageCode) {
    const [addresses] = await db.sequelize.query(
      `
    select distinct p.eth_address as address
      from growth_participant p, growth_event e 
      where p.eth_address=e.eth_address 
        and e.type='MobileAccountCreated' 
        and p.data->>'language'=:languageCode
    `,
      {
        replacements: {
          languageCode
        }
      }
    )

    if (!addresses.length) {
      logger.error('There are no addresses for language', languageCode)
      return
    }

    const mobileRegisters = await MobileRegistry.findAll({
      where: {
        deviceToken: { [Sequelize.Op.ne]: null },
        deviceType,
        ethAddress: {
          [Sequelize.Op.in]: addresses.map(a => a.address.toLowerCase())
        },
        deleted: false,
        'permissions.alert': true
      },
      order: [['updatedAt', 'DESC']] // Most recently updated records first.
    })

    logger.debug(`Found ${mobileRegisters.length} ${deviceType} devices`)

    await this._sendInChunks(data, deviceType, mobileRegisters)
  }

  async multicastMessage(data) {
    const {
      target, // One of `all`, `address`, `country` or `language`
      targetAddress, // A single address or an array of target addresses
      countryCode,
      languageCode
    } = data

    logger.debug('Received data for PN', JSON.stringify(data))

    try {
      if (target === 'all') {
        await this._sendToAllDevices(data, 'APN')
        await this._sendToAllDevices(data, 'FCM')
      } else if (target === 'address') {
        const addresses =
          targetAddress instanceof Array ? targetAddress : [targetAddress]
        await this._sendToManyAddresses(data, 'APN', addresses)
        await this._sendToManyAddresses(data, 'FCM', addresses)
      } else if (target === 'country') {
        await this._sendToCountryCode(data, 'APN', countryCode)
        await this._sendToCountryCode(data, 'FCM', countryCode)
      } else if (target === 'language') {
        await this._sendToLangCode(data, 'APN', languageCode)
        await this._sendToLangCode(data, 'FCM', languageCode)
      }

      return {
        ok: true
      }
    } catch (error) {
      logger.error(error)
      return {
        ok: false
      }
    }
  }
}

module.exports = MobilePush
