export const unreadStatus = 'unread'
export const readStatus = 'read'
export const notificationStatuses = [unreadStatus, readStatus]

export const storeKeys = {
  notificationSubscriptionStart: 'notification_subscription_start',
  notificationStatuses: 'notification_statuses'
}

export class Notification {
  constructor({ id, event, type, status, resources = {} } = {}) {
    // Unique id with format <network>-<marketplace contract version>-<txn hash>.
    this.id = id
    // Web3 event.
    this.event = event
    // See src/contractInterface/marketplace/v00_adapter.js for list of types.
    this.type = type
    // 'read' or 'unread'.
    this.status = status
    // Resources includes the following fields:
    // - listing: Listing model object
    // - offer: Offer model object
    this.resources = resources
  }
}
