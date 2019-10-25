import gql from 'graphql-tag'

export default gql`
  query WalletStatus {
    web3 {
      metaMaskAccount {
        id
      }
    }
    messaging(id: "defaultAccount") {
      id
      pubKey
      pubSig
      enabled
      isKeysLoading
      synced
      syncProgress
    }
  }
`
