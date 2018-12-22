import gql from 'graphql-tag'

export default gql`
  query Transactions {
    web3 {
      metaMaskAccount {
        id
      }
      transactions {
        id
        status
        mutation
        confirmations
      }
    }
  }
`
