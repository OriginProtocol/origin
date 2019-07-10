export const mutations = `
  extend type Mutation {
    deployIdentity(
      from: String!
      profile: ProfileInput
      attestations: [String]
    ): Transaction

    deployIdentityEvents(from: String!): Transaction

    deployProxyFactory(from: String!): Transaction
    deployIdentityProxy(from: String!): Transaction
    deployIdentityViaProxy(from: String!, factoryAddress: String, proxyAddress: String, owner: String!): Transaction
  }
`

export const types = `
  extend type Query {
    identityEvents: IdentityEvents
    identity(id: ID!): Identity
    identities(id: ID!): Identity
  }

  input ProfileInput {
    firstName: String
    lastName: String
    description: String
    avatar: String
    avatarUrl: String
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

    getAuthUrl(provider: String!, redirect: String): String

    attestationProviders: [String]
  }

  type IdentityConnection {
    nodes: [Identity]
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type VerifiedAttestationProperty {
    type: String!
    value: String
  }

  type VerifiedAttestation {
    id: String!
    rawData: String!
    properties: [VerifiedAttestationProperty]
  }

  type Identity {
    id: ID!
    owner: Account

    firstName: String
    lastName: String
    fullName: String
    description: String
    # Deprecated field. Base64 encoded avatar. Only present on older profiles.
    avatar: String
    # IPFS url for avatar photo
    avatarUrl: String
    # Calculated field. Converts avatarURL to an HTTP(s) gateway URL
    avatarUrlExpanded: String
    strength: Int

    verifiedAttestations: [VerifiedAttestation]

    name: String
    ipfsHash: String
    attestations: [String]
  }
`
export default types + mutations
