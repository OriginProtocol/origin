import gql from 'graphql-tag'

export default gql`
  query Conversations($wallet: String) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversations(wallet: $wallet) {
        id
        timestamp
        totalUnread(wallet: $wallet)
        messages {
          status
          address
          content
          timestamp
        }
        lastMessage {
          media {
            url
            contentType
          }
          content
          timestamp
        }
      }
    }
  }
`
