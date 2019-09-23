const web3Utils = require('web3-utils')
const NotificationLog = require('./models').NotificationLog
const Sequelize = require('sequelize')
const Op = Sequelize.Op

function getMessageFingerprint(messageObject) {
  return web3Utils.keccak256(JSON.stringify(messageObject))
}

/**
 * Checks if a message was already sent within the last config.dupeLookbackMs.
 *
 * TODO: Handle the case where a user may have multiple mobile devices
 * registered under the same Eth address. The current implementation
 * only allows to send a notification to a single device. But we should
 * probably send it to all the devices that are registered.
 *
 * @param messageFingerprint
 * @param config
 * @returns {Promise<*>}
 */
async function isNotificationDupe(messageFingerprint, config) {
  return NotificationLog.count({
    where: {
      messageFingerprint: messageFingerprint,
      createdAt: {
        [Op.gte]: new Date(Date.now() - config.dupeLookbackMs)
      }
    }
  })
}

async function logNotificationSent(messageFingerprint, ethAddress, channel) {
  return NotificationLog.create({
    messageFingerprint,
    ethAddress, // Model will force this to lowercase
    channel
  })
}

module.exports = {
  getMessageFingerprint,
  isNotificationDupe,
  logNotificationSent
}
