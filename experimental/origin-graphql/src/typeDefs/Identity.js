export default `
  type Identity {
    id: ID!
    name: String
    claims: [Claim]
    profile: ProfileData
  }

  type ProfileData {
    id: ID!
    firstName: String
    lastName: String
    description: String
    avatar: String
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
