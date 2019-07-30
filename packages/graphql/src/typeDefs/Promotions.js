export default `
  type VerifyPromotionResult {
    success: Boolean
    reason: String
    data: String
  }
  extend type Mutation {
    verifyPromotion(identity: String!, identityProxy: String, socialNetwork: String!, type: String!, content: String): VerifyPromotionResult!
  }
`
