var price = `
  type Price {
    currency: String
    amount: String
  }
`
var pageInfo = `
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }
`

module.exports = { pageInfo, price }