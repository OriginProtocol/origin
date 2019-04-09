import gql from 'graphql-tag'

export default gql`
  mutation SwapToToken($from: String!, $token: String!, $tokenValue: String!) {
    swapToToken(from: $from, token: $token, tokenValue: $tokenValue) {
      id
    }
  }
`
