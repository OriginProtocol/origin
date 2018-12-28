export default `
  extend type Query {
    userRegistry: UserRegistry
  }

  extend type Mutation {
    deployUserRegistry(from: String): Transaction
    deployIdentityContract(from: String!, contract: String!): Transaction
    deployIdentity(
      from: String!
      profile: ProfileInput
      attestations: [AttestationInput]
    ): Transaction
  }

  input ProfileInput {
    firstName: String
    lastName: String
    description: String
    avatar: String
  }

  input AttestationInput {
    topic: String!
    issuer: String!
    signature: String!
    data: String!
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

  type IdentityConnection {
    nodes: [Identity]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Identity {
    id: ID!
    owner: Account
    name: String
    claims: [Claim]
    profile: ProfileData
  }

  type ProfileData {
    id: ID!
    firstName: String
    lastName: String
    fullName: String
    description: String
    avatar: String
    strength: String

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
