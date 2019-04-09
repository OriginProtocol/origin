module.exports = `
  extend type Query {
    currency(id: ID!): Currency
    currencies(tokens: [String]): [Currency]
  }

`
