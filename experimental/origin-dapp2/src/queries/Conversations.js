import gql from 'graphql-tag'

export default gql`
  query Conversations {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversations {
        id
        timestamp
        totalUnread
        messages {
          status
          address
          content
          timestamp
        }
        lastMessage {
          address
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
