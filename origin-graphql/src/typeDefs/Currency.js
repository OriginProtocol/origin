module.exports = `
  extend type Query {
    currency(id: ID!): Currency
    currencies: [Currency]
  }

`
