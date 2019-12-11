export const mutations = `
  extend type Mutation {
    login(wallet: String!): LoginResult
    logout(wallet: String!): LoginResult
  }

  extend type Query {
    isLoggedIn(wallet: String!): Boolean
    tokenStatus(wallet: String!): TokenStatusResult
  }

  extend type Subscription {
    loggedIn: LoggedInSubscription
  }

  type LoggedInSubscription {
    wallet: String
  }
`
export const types = `
  type LoginResult {
    success: Boolean
    reason: String
  }

  type TokenStatusResult {
    valid: Boolean
    expired: Boolean
    willExpire: Boolean
  }
`

export default types + mutations
