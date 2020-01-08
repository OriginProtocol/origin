import gql from 'graphql-tag'

export default gql`
  subscription onWalletUpdate {
    walletUpdate {
      primaryAccount {
        id
      }
    }
  }
`
