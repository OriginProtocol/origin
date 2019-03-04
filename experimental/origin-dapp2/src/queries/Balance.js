import gql from 'graphql-tag'

export default gql`
  query EthBalance {
    web3 {
      primaryAccount {
        id
        balance {
          eth
        }
      }
    }
  }
`
