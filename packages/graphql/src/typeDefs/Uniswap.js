module.exports = `
  extend type Mutation {
    swapToToken(from: String!, token: String!, tokenValue: String!): Transaction
    uniswapDeployFactory(from: String!): Transaction
    uniswapDeployExchangeTemplate(from: String!): Transaction
    uniswapInitializeFactory(from: String!, exchange: String, factory: String): Transaction
    uniswapCreateExchange(from: String!, tokenAddress: String!, factory: String): Transaction
    uniswapAddLiquidity(from: String!, exchange: String!, value: String!, tokens: String!, liquidity: String!): Transaction
  }
`
