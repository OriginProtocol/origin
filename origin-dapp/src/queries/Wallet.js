import gql from 'graphql-tag'

export default gql`
  query Wallet {
    web3 {
      metaMaskAccount {
        id
      }
      walletType
      mobileWalletAccount {
        id
      }
    }
  }
`
