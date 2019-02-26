const Price = `
  type Price {
    currency: String
    amount: String
  }
`

const TranslatedString = `
  type TranslatedString {
    key: String!
    default: String!
  }
`

const PageInfo = `
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }
`

module.exports = { PageInfo, Price, TranslatedString }
