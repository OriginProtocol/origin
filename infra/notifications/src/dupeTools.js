const web3Utils = require('web3-utils')
const NotificationLog = require('./models').NotificationLog
const Sequelize = require('sequelize')
const Op = Sequelize.Op

function getMessageFingerprint(messageObject) {
  return web3Utils.keccak256(JSON.stringify(messageObject))
}

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
