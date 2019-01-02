class Enum extends Array {
  constructor(...args) {
    super(...args)

    for(const k of args) {
      this[k] = k
    }
  }

}

const EthNotificationTypes = new Enum("APN", "FCM", "email")
const MessageTypes = new Enum("SESSION", "CONTEXT", "CALL", "CALL_RESPONSE", "LOGOUT", "LINK_REQUEST")

module.exports = {EthNotificationTypes, MessageTypes}
