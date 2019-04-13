module.exports = `
  extend type Query {
    facebookAuthURL: String
    googleAuthURL: String
  }

  extend type Mutation {
    generatePhoneCode(prefix: String!, method: String, phone: String!): AttestationCodeResult!
    verifyPhoneCode(prefix: String!, identity: String, phone: String!, code: String!): AttestationVerifyResult!

    generateEmailCode(email: String!): AttestationCodeResult!
    verifyEmailCode(email: String!, identity: String, code: String!): AttestationVerifyResult!

    verifyFacebook(identity: String!, authUrl: String): AttestationVerifyResult!
    verifyTwitter(identity: String!, authUrl: String): AttestationVerifyResult!
    verifyGoogle(identity: String!, authUrl: String): AttestationVerifyResult!

    generateAirbnbCode(identity: String!, airbnbUserId: String!): AttestationCodeResult!
    verifyAirbnbCode(identity: String!, airbnbUserId: String!): AttestationVerifyResult!
  }

  type AttestationCodeResult {
    success: Boolean
    reason: String
    code: String
  }

  type AttestationVerifyResult {
    success: Boolean
    reason: String
    data: String
  }
`
