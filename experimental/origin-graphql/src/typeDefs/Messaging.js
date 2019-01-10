export default `
  extend type Query {
    messaging(id: String!): Messaging
  }

  extend type Mutation {
    enableMessaging: Boolean
    sendMessage(to: String!, content: String!): Boolean
  }

  type Messaging {
    id: ID!
    enabled: Boolean
    syncProgress: String
    synced: Boolean
    pubKey: String
    pubSig: String
    conversations: [Conversation]
  }

  type Conversation {
    id: ID!
    timestamp: String
    messages: [Message]
  }

  type Message {
    id: ID!
    address: String
    hash: String
    index: Int
    msg: MessageContent
  }

  type MessageContent {
    content: String
    created: String
  }

`
