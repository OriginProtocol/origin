module.exports = `
  extend type Mutation {
    generatePhoneCode(prefix: String!, method: String, phone: String!): AttestationCodeResult!
    verifyPhoneCode(prefix: String!, identity: String, phone: String!, code: String!): AttestationVerifyResult!

    generateEmailCode(email: String!): AttestationCodeResult!
    verifyEmailCode(email: String!, identity: String, code: String!): AttestationVerifyResult!

    verifyFacebook(identity: String!, redirect: Boolean, authUrl: String, code: String): AttestationVerifyResult!
    verifyTwitter(identity: String!, redirect: Boolean, authUrl: String, code: String): AttestationVerifyResult!
    verifyGoogle(identity: String!, redirect: Boolean, authUrl: String, code: String): AttestationVerifyResult!

    generateAirbnbCode(identity: String!, airbnbUserId: String!): AttestationCodeResult!
    verifyAirbnbCode(identity: String!, airbnbUserId: String!): AttestationVerifyResult!

    generateWebsiteCode(identity: String!, website: String!): AttestationCodeResult!
    verifyWebsite(identity: String!, website: String!): AttestationVerifyResult!
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
