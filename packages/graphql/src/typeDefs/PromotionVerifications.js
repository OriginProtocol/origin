export const mutations = `
  extend type Mutation {
    verifyPromotion(identity: String!, socialNetwork: String!, type: String!, content: String): VerifyPromotionResult!
  }
`

export const types = `
  type VerifyPromotionResult {
    success: Boolean
    reason: String
    data: String
  }

  type PromotionStatusResult {
    socialNetwork: String!
    type: String!
    identity: String!
    status: String!
    totalTries: Int
    lastVerified: Int
  }

  extend type Query {
    promotionVerifications: PromotionVerifications
  }

  type PromotionVerifications {
    getVerificationStatus(identity: String!): [PromotionStatusResult]
  }

`

export default types + mutations
