import gql from 'graphql-tag'

export default gql`
  query Profile {
    web3 {
      networkName
      metaMaskAccount {
        id
        checksumAddress
        balance {
          eth
        }
      }
    }
  }
`
