import gql from 'graphql-tag'

export default gql`
  mutation Login($wallet: String!) {
    login(wallet: $wallet) {
      success
      reason
    }
  }
`
