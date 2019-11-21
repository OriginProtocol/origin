import gql from 'graphql-tag'

export default gql`
  query Auth($wallet: String!) {
    isLoggedIn(wallet: $wallet)
  }
`
