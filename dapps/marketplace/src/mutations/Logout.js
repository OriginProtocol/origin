import gql from 'graphql-tag'

export default gql`
  mutation Logout($wallet: String!) {
    logout(wallet: $wallet) {
      success
      reason
    }
  }
`
