export const unreadStatus = 'unread'
export const readStatus = 'read'
export const notificationStatuses = [unreadStatus, readStatus]

export const storeKeys = {
  notificationSubscriptionStart: 'notification_subscription_start',
  notificationStatuses: 'notification_statuses'
}

export class Notification {
  constructor({ id, event, type, status, resources = {} } = {}) {
    this.id = id
    this.event = event
    this.type = type
    this.status = status
    this.resources = resources
  }
}
