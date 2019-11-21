import gql from 'graphql-tag'

export default gql`
  query WalletStatus {
    web3 {
      networkId
      networkName
      walletType
      metaMaskEnabled
      metaMaskAvailable
      metaMaskApproved
      metaMaskUnlocked
      metaMaskNetworkId
      metaMaskNetworkName
      metaMaskAccount {
        id
      }
    }
  }
`
