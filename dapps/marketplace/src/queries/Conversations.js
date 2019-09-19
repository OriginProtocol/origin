import gql from 'graphql-tag'

export default gql`
  query Conversations($limit: Int, $offset: Int) {
    messaging(id: "defaultAccount") {
      id
      enabled
      conversations(limit: $limit, offset: $offset) {
        id
        timestamp
        totalUnread
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
