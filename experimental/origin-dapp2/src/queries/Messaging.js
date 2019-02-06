import gql from 'graphql-tag'

const MessagingQuery = gql`
  query MessagingStatus {
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
      synced
      syncProgress
      totalUnread
    }
  }
`

export default MessagingQuery
