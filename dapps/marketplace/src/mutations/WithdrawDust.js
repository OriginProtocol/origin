import gql from 'graphql-tag'

export default gql`
  mutation WithdrawDust(
    $from: String
    $currency: String!
    $amount: String!
  ) {
    withdrawDust(
      amount: $amount
      from: $from
      currency: $currency
    ) {
      id
    }
  }
`
