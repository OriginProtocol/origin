module.exports = `
  extend type Query {
    notifications: NotificationConnection
  }

  extend type Subscription {
    newNotification: NewNotification
  }

  type NewNotification {
    node: Notification!
    totalCount: Int
    totalUnread: Int
  }

  type NotificationConnection {
    nodes: [Notification]
    pageInfo: PageInfo!
    totalCount: Int!
    totalUnread: Int
  }

  type Notification {
    id: ID!
    title: String
    timestamp: Int
    image: String
    content: String
    read: Boolean
  }
`
