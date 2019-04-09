module.exports = `
  type Price {
    currency: CurrencyResult
    amount: String
  }

  type PageInfo {
    endCursor: String
    hasNextPage: Boolean!
    hasPreviousPage: Boolean!
    startCursor: String
  }

  union CurrencyResult = FiatCurrency | Token

  interface Currency {
    id: ID!
    name: String
    code: String
    priceInUSD: Float
  }

  type Token implements Currency {
    # In the format 'token-SYMBOL', eg 'token-DAI'
    id: ID!

    # Name of token eg Maker DAI
    name: String

    # ETH, DAI, OGN, etc
    code: String

    # Price of 1 unit in USD
    priceInUSD: Float

    # Contract address
    address: String

    # Number of decimals
    decimals: Int

    # Number of tokens in circulation
    totalSupply: String

    # Balance of given address
    balance(address: String!): String

    # Allowance of given address
    allowance(address: String!, target: String!): String
  }

  type FiatCurrency implements Currency {
    # In the format 'fiat-COUNTRY_CODE', eg 'fiat-USD'
    id: ID!

    # Long form name, 'US Dollar' etc
    name: String

    # USD, GBP, EUR, etc
    code: String

    # Price of 1 unit in USD
    priceInUSD: Float

    # Array of countries using this currency
    countryCodes: [String]
  }
`
