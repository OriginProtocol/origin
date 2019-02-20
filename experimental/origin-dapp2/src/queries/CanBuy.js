import gql from 'graphql-tag'

export default gql`
  query CanBuy {
    web3 {
      networkId
      networkName
      metaMaskNetworkId
      metaMaskNetworkName
      metaMaskAccount {
        id
        balance {
          eth
        }
      }
      walletType
    }
  }
`
