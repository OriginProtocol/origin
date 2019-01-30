module.exports = `
  extend type Query {
    messaging(id: String!): Messaging
  }

  extend type Mutation {
    enableMessaging: Boolean
    sendMessage(to: String!, content: String, media: [MediaInput]): Conversation
    updateMessage(status: String!, hash: String!): Message
  }

  type Messaging {
    id: ID!
    enabled: Boolean
    syncProgress: String
    synced: Boolean
    pubKey: String
    pubSig: String
    conversations: [Conversation]
    conversation(id: String!): Conversation
  }

  type Conversation {
    id: ID!
    timestamp: Int
    messages: [Message]
    lastMessage: Message
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
  }

`
