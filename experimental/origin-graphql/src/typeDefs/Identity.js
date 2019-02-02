module.exports = `
  extend type Query {
    userRegistry: UserRegistry
    identityEvents: IdentityEvents
    identity(id: ID!): Identity
    identities(id: ID!): Identity
  }

  extend type Mutation {
    deployUserRegistry(from: String!): Transaction
    deployIdentityContract(from: String!, contract: String!): Transaction

    deployIdentity(
      from: String!
      profile: ProfileInput
      attestations: [String]
    ): Transaction

    deployIdentityEvents(from: String!): Transaction

    updateIdentity(
      from: String!
      identity: String!
      profile: ProfileInput
      attestations: [String]
    ): Transaction
  }

  input ProfileInput {
    firstName: String
    lastName: String
    description: String
    avatar: String
  }

  type UserRegistry {
    id: ID
    identities(
      first: Int
      last: Int
      before: String
      after: String
      sort: String
    ): IdentityConnection
  }

  type IdentityEvents {
    id: ID
    identities(
      first: Int
      last: Int
      before: String
      after: String
      sort: String
    ): IdentityConnection
  }

  type IdentityConnection {
    nodes: [Identity]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Identity {
    id: ID!
    owner: Account

    firstName: String
    lastName: String
    fullName: String
    description: String
    avatar: String
    strength: Int

    facebookVerified: Boolean
    twitterVerified: Boolean
    airbnbVerified: Boolean
    phoneVerified: Boolean
    emailVerified: Boolean

    name: String
    attestations: [String]
  }

  type ProfileData {
    id: ID!
    firstName: String
    lastName: String
    fullName: String
    description: String
    avatar: String
    strength: Int

    facebookVerified: Boolean
    twitterVerified: Boolean
    airbnbVerified: Boolean
    phoneVerified: Boolean
    emailVerified: Boolean
  }

  type Claim {
    id: ID!
    topic: String
    scheme: String
    issuer: String
    signature: String
    data: String
    uri: String
  }
`
