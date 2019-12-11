import gql from 'graphql-tag'

export default gql`
  subscription onLoggedIn {
    loggedIn {
      wallet
    }
  }
`
