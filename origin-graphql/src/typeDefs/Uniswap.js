module.exports = `
  extend type Mutation {
    swapToToken(from: String!, token: String!, tokenValue: String!): Transaction
  }
`
