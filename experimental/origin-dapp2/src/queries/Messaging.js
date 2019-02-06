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

// const MessagingQuery = gql`
//   query WalletStatus {
//     web3 {
//       metaMaskAccount {
//         id
//       }
//     }
//     messaging(id: "defaultAccount") {
//       id
//       pubKey
//       pubSig
//       enabled
//       synced
//       syncProgress
//     }
//   }
// `

export default MessagingQuery
