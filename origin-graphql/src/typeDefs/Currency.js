module.exports = `
  extend type Query {
    currency(id: ID!): Currency
    currencies: [Currency]
  }

  union Currency = FiatCurrency | Token

  type FiatCurrency {
    # In the format 'fiat-COUNTRY_CODE', eg 'fiat-USD'
    id: ID!

    # Long form name, 'US Dollar' etc
    name: String

    # USD, GBP, EUR, etc
    code: String

    # $, £, etc
    symbol: String

    # 1 USD =
    exchangeRate: Float

    # Array of countries using this currency
    countryCodes: [String]

    convertTo(currency: ID!): String
  }
`
