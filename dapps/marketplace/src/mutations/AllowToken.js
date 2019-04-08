import gql from 'graphql-tag'

export default gql`
  mutation AllowToken(
    $token: String!
    $from: String!
    $to: String!
    $value: String!
  ) {
    updateTokenAllowance(token: $token, from: $from, to: $to, value: $value) {
      id
    }
  }
`
