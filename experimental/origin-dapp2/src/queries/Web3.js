import gql from 'graphql-tag'

export default gql`
  query Web3 {
    web3 {
      networkId
      networkName
      walletType
    }
  }
`
