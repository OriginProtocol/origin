class Enum extends Array {
  constructor(...args) {
    super(...args)

    for(const k of args) {
      this[k] = k
    }
  }

}

EthNotificationTypes = new Enum("APN", "FCM", "email")
MessageTypes = new Enum("NETWORK", "ACCOUNTS", "CALL", "CALL_RESPONSE", "LOGOUT")

module.exports = {EthNotificationTypes, MessageTypes}
