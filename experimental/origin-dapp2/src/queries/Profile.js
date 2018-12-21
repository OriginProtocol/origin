import gql from 'graphql-tag'

export default gql`
  query Profile {
    web3 {
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
