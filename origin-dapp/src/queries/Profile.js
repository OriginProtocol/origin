import gql from 'graphql-tag'

export default gql`
  query Profile {
    web3 {
      primaryAccount {
        id
        checksumAddress
      }
      walletType
    }
  }
`
