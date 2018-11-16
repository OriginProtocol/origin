import gql from 'graphql-tag'

export default gql`
  {
    web3 {
      transactions {
        id
        blockNumber
        pct
        status
      }
    }
  }
`
