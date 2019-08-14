export const mutations = `
  extend type Mutation {
    generatePhoneCode(prefix: String!, method: String, phone: String!): AttestationCodeResult!
    verifyPhoneCode(prefix: String!, identity: String, phone: String!, code: String!): AttestationVerifyResult!

    generateEmailCode(email: String!): AttestationCodeResult!
    verifyEmailCode(email: String!, identity: String, code: String!): AttestationVerifyResult!

    verifyOAuthAttestation(provider: String!, identity: String!, redirect: String, authUrl: String, code: String): AttestationVerifyResult!

    generateAirbnbCode(identity: String!, airbnbUserId: String!): AttestationCodeResult!
    verifyAirbnbCode(identity: String!, airbnbUserId: String!): AttestationVerifyResult!

    generateWebsiteCode(identity: String!, website: String!): AttestationCodeResult!
    verifyWebsite(identity: String!, website: String!): AttestationVerifyResult!

    generateTelegramCode(identity: String!): AttestationCodeResult!
    verifyTelegramCode(identity: String!, code: String!): AttestationVerifyResult!
  }
`
export const types = `
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

export default types + mutations
