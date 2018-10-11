const unreadStatus = 'unread'
const readStatus = 'read'
const notificationStatuses = [unreadStatus, readStatus]

const storeKeys = {
  notificationSubscriptionStart: 'notification_subscription_start',
  notificationStatuses: 'notification_statuses'
}

class Notification {
  constructor({ id, event, type, status, resources = {} } = {}) {
    this.id = id
    this.event = event
    this.type = type
    this.status = status
    this.resources = resources
  }
}

module.exports = {
  Notification,
  readStatus,
  unreadStatus,
  notificationStatuses,
  storeKeys
}
