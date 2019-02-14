import gql from 'graphql-tag'

export default gql`
  query AccountTokenBalance(
    $account: String!
    $token: String!
    $currency: String
  ) {
    web3 {
      account(id: $account) {
        id
        token(symbol: $token) {
          id
          balance
          token {
            id
            decimals
            exchangeRate(currency: $currency)
          }
        }
      }
    }
  }
`
