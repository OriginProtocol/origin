module.exports = `
  extend type Subscription {
    messageAdded: NewMessageResult
    markedAsRead: MarkedAsReadResult
    messagingStatusChange: MessagingStatusChangeResult
  }

  type NewMessageResult {
    conversationId: String
    roomId: String
    message: Message
  }

  type MarkedAsReadResult {
    conversationId: String
    roomId: String
    messagesRead: Int
  }

  type MessagingStatusChangeResult {
    newStatus: String
  }

  extend type Query {
    messaging(id: String!): Messaging
  }

  extend type Mutation {
    enableMessaging: Boolean
    sendMessage(to: String!, content: String, media: [MediaInput]): Conversation
    markConversationRead(id: String!): MarkReadResult
  }

  type MarkReadResult {
    success: Boolean
    messagesRead: Int
  }

  type Messaging {
    id: ID!
    enabled: Boolean
    syncProgress: String
    synced: Boolean
    pubKey: String
    pubSig: String
    conversations(limit: Int, offset: Int): [Conversation]
    conversation(id: String!, before: Int, after: Int): Conversation
    canConverseWith(id: String!): Boolean
    forwardTo(id: String!): String
    totalUnread: Int
    decryptOutOfBandMessage(encrypted: String): OutOfBandMessage
    decryptShippingAddress(encrypted: String!): ShippingAddress
  }

  type Conversation {
    id: ID!
    timestamp: Int
    messages: [Message]
    lastMessage: Message
    totalUnread: Int
    hasMore: Boolean
  }

  type Message {
    id: ID!
    address: String
    hash: String
    index: Int
    content: String
    media: [Media]
    timestamp: Int
    status: String
    type: String
    offer: Offer
    eventData: MarketplaceEventData
  }

  type MarketplaceEventData {
    eventType: String
  }

  type OutOfBandMessage {
    content: String
    media: [Media]
    timestamp: Int
  }

  type ShippingAddress {
    name: String
    address1: String
    address2: String
    city: String
    stateProvinceRegion: String
    postalCode: String
    country: String
    instructions: String
  }
`
