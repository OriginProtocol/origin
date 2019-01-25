var Price = `
  type Price {
    currency: String
    amount: String
  }
`
var PageInfo = `
  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }
`

module.exports = { PageInfo, Price }