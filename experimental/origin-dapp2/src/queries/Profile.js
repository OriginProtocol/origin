import gql from 'graphql-tag'

export default gql`
  query Profile {
    web3 {
      networkName
      primaryAccount {
        id
        checksumAddress
        balance {
          eth
        }
      }
      walletType
    }
  }
`
